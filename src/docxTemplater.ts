import Pizzip from 'pizzip'
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { getDocxTemplateFile } from './docxStorage';
import paragraphStyleTranspile from './ShortStyleTranspile';

var docxTemplateURI : string[] = [];
var outputFileName : string[] = [];
var inputVar = {};

/**
 * 
 * Maak Word Docx van een template en inputdata
 * 
 * @param inputData = json file
 * @param binaries = docx template as ArrayBuffer
 * 
 */
export function makeDocx( inputData, binaries){
  console.log("MS Word templater gestart");

  docxTemplateURI.length = 0;//empty the array if need be
  outputFileName.length = 0;//empty the array if need be

  let variables = input2Object(inputData);
  //console.log("DOCX input parsed", variables, "/nInput data: ", inputData);
  //test whether the template is succesfully identified, otherwise stop processing
  if(docxTemplateURI.length == 0 ){ 
    console.error("Docx file niet in orde", docxTemplateURI, binaries)
    throw Error(`Docx file met naam: "${docxTemplateURI}" niet gevonden of leeg.`); 
  }
  //maar 1 document en geen filenaam, maak een standaard filenaam
  else if (docxTemplateURI.length == 1 && outputFileName.length == 0){ outputFileName.push('Bestand gegeneerd met DMN by Legal LinQ'); }
  //wanneer documenten en namen array NIET van gelijke lengte, geef error (anders wordt mogelijk verkeerde naam gekoppeld aan document)
  else if (docxTemplateURI.length != outputFileName.length) { throw Error(); }
  //we gaan het document opvragen en aanmaken
  else {
    try{ 
      let y;
      //mogelijk meerdere documenten...
      for (y=0;y<docxTemplateURI.length;y++) {
        getDocxTemplateFile(binaries, docxTemplateURI[y], outputFileName[y])
        .then((docxLoadedAsArrayBuffer)=>{ 
          if(docxLoadedAsArrayBuffer !== undefined){
            renderDocx(variables, docxLoadedAsArrayBuffer.code, docxLoadedAsArrayBuffer.fileName); 
          }
          else{ throw new Error(`The docx template ${docxTemplateURI[y]} was expected but not present or found.`)}
        }
        )
      }
    }
    catch(e){
      let errorMessage = 'No MS Word document was uploaded, such is needed as template. Please upload before or together with the Excel file.<br /><em>When you want to detect missing docx template at upload, include in the url "?docx=true", which will be set to true when the template is uploaded.</em>'
      throw new Error(errorMessage);
    }
  }
}

function renderDocx(variables, docxTemplate, fileName){
    var zip = new Pizzip(docxTemplate);
    var doc = new Docxtemplater().loadZip(zip);

    doc.setData(variables);
    // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
    try { doc.render() }
    catch (err) {
        if(err instanceof Error) var e = { message: err.message, name: err.name,  stack: err.stack }
        console.error('DocX rendering error (docxTemplater.ts), see below');
        throw err; // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
    }
    //clean outputFileName from invalid strings and build filename with docx
    let outputFileNameClean = fileName.replace(/[^a-z0-9-_ ]/ig, "") +'.docx';

    var out = doc.getZip().generate({
        type: "blob",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }); //Output the document using Data-URI
    saveAs(out, outputFileNameClean);
}
//docx input to JSON
function input2Object(r,defaultStyle = null, defaultTag = null){
    let i;
    for (i=0;i<r.length;i++) {
        //console.log("ARRAY \nDocxStyle: ", r[i]['docxStyle'], "\nDocxValue:", r[i]['docx'], "\n:DocxTag:", r[i]['docxTag'])
      // empty strings are consideren undefined
        Object.keys(r[i]).forEach((k) => { if(typeof r[i][k] =='string' 
                                          && (r[i][k].trim().length == 0 || r[i][k].trim() == "-")
                                          ){ r[i][k] = undefined } 
                                        })                                          ;
        
        //set default styles and tags, not to override though
        if(r[i]['docxStyle'] == undefined && defaultStyle !== null) r[i]['docxStyle'] == defaultStyle;
        if(r[i]['docxTag'] == undefined && defaultTag !== null) r[i]['docxTag'] == defaultTag;

        //no docxTag and no docx, stop here, unless docx is an array than docxTag does not need to be defined
        if( (r[i]['docxTag'] == undefined && !Array.isArray(r[i]['docx']) ) || r[i]['docx'] == undefined){
          console.warn("MS Word templater docx or docxTag not found, Tag was:", r[i]['docxTag'], "\nDocx value was:",  r[i]['docx'])
          continue;
        } 

        else if( Array.isArray(r[i]['docx']) ){

          //test first Array entry to check whether this is JSON and if so contains a docx key
          if(isJson(r[i]['docx'][0]) && typeof JSON.parse(r[i]['docx'][0])['docx'] !== 'undefined' ){
            //console.log("Array nested for inputObject\nDocxStyle: ", r[i]['docxStyle'], "\nDocxValue:", r[i]['docx'], "\n:DocxTag:", r[i]['docxTag'])
            input2Object(r[i]['docx'].map(item => JSON.parse(item)), //parse each object in the arraylist
              ( r[i]['docxStyle'] && r[i]['docxStyle'].trim() !== '-' ) ? r[i]['docxStyle']:null, //default docxStyle
              ( r[i]['docxTag'] && r[i]['docxTag'].trim() !== '-' ) ? r[i]['docxTag']:null //default docxTag
              );
            continue; //na de loop over de array, ga door
          }
          else{ //simply flatten the list with a carriage return
            //console.log("Array List, no tags, nested, with inputObject\nDocxStyle: ", r[i]['docxStyle'], "\nDocxValue:", r[i]['docx'], "\n:DocxTag:", r[i]['docxTag'])
            console.warn("DOCX valua was a list, but converted to text. \nNewlines are ignored, new lines can only used with {@raw} values (using a docxStyle).")
            let tempValue = "";
            r[i]['docx'].forEach(v => { tempValue += v.replace(/\r?\n/g, "  ") }  ); //flatten values, new lines are replaced by spaces
            r[i]['docx'] = tempValue;
          }
        }

        //get docxTemplate
        if(r[i]['docxTag'] == 'TemplateLocation'){ docxTemplateURI.push( r[i]['docx'] ); continue; }
        //get output filename
        if(r[i]['docxTag'] == 'OutputFileName'){ outputFileName.push ( r[i]['docx'] ); continue; }

        //raw XML styled heading, but only with docxStyle and value as string or array
        if (r[i]['docxStyle'] && r[i]['docxStyle'] != undefined && typeof r[i]['docx'] == 'string' ) {
          
          //if (r[i - 1]['docxTag'] == r[i]['docxTag']) { //when former docxTag is same as current, add current xml to former xml
          //if inputVar docxTag exist, add value to that. So tags can be in more than one decision/excelsheet
          if(typeof inputVar[r[i]['docxTag']] !== 'undefined'){
            inputVar[r[i]['docxTag']] += rawDocxXML(r[i]['docxStyle'], r[i]['docx']);
          }
          //probably first of a series of raw inputs
          else {
            inputVar[r[i]['docxTag']] = rawDocxXML(r[i]['docxStyle'], r[i]['docx']);
          }
        }
        //docx is a variable instead of rawXML
        else {
          //correct for when value is not a string, may look strange in output but can then be corrected to string
          if(typeof r[i]['docx'] !== 'string'){ inputVar[r[i]['docxTag']] = JSON.stringify(r[i]['docx']).replace(/(\n)/g,"  ") }
          else{ inputVar[r[i]['docxTag']] = r[i]['docx'].replace(/(\n)/g,"  "); }//handle line feeds
        }
    }
    return inputVar;
}

import XMLWriter from 'xml-writer';

function rawDocxXML(pStyleExcel, value){

  //fetch correct pStyle
  let pStyle = paragraphStyleTranspile(pStyleExcel);

  var xw = new XMLWriter(true);

  //make from line feeds paragraphs in Word, convert to array first
  let textArray = value.split(/\r?\n/g);
  textArray.forEach(text => {

    //Start w:p
    xw.startElement("w:p"); 

    //pStyle is undefined by een 'Normal' style, de Standaard style
    if(pStyle['main'] != "Normal"){
      //Start w:pPr
      xw.startElement("w:pPr")

        //Start & End w:pStyle
        xw.startElement("w:pStyle"); xw.writeAttribute("w:val",pStyle['main']); xw.endElement();

      //end w:pPr
      xw.endElement();
    }

      xw.startElement("w:r")
        xw.startElement("w:t").writeAttribute("xml:space","preserve").text(text); xw.endElement();
      xw.endElement();
    //}
    xw.endElement();
  
  });
  
  return xw.output;
}

//checks for JSON and if result is an object (including objects that are array's)
function isJson(item) {
  item = typeof item !== "string"
      ? JSON.stringify(item)
      : item;

  try {
      item = JSON.parse(item);
  } catch (e) {
      return false;
  }

  if (typeof item === "object" && item !== null) {
      return true;
  }

  return false;
}
