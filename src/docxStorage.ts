
//GET DOCX FILE
export async function getDocxTemplateFile(binaries, URI, fileName){
  let wordAsArrayBuffer; 

  //test URI, is it full URI or reference to current uri? When local reference, add full path
  if (URI.indexOf("https://") == -1 && URI.indexOf("http://") == -1){

    //test whether file is already loaded and if so return and stop further processing
    if (typeof binaries[URI] !== 'undefined') {
      wordAsArrayBuffer = binaries[URI];
      return {'code': wordAsArrayBuffer, 'fileName' : fileName }; // is Ms Word docx as arrayBuffer
    }
  }
  //add http when not provided and file is also nog already loaded
  else{  URI = window.location.href +"/"+ URI }

  let xhref = await fetch(URI);

  if(!xhref.ok){ 
    console.error("spHttpClient returned: ", xhref.statusText); 
    return undefined;
  }
  else{ 
    wordAsArrayBuffer = xhref.arrayBuffer();
    return {'code': wordAsArrayBuffer, 'fileName' : fileName }; // is Ms Word docx as arrayBuffer
  }
  return undefined; //safety, always return something but probably unreachable code
}

//Object in JSON with one or more docx in char....
export function StringToArrayBuffer(docxAsString){
  let binaries = {};
  let PreLoadedObjOfStrings = JSON.parse(docxAsString);
  Object.keys(PreLoadedObjOfStrings).forEach((docName) => {
    binaries[docName] = Uint8Array.from([...PreLoadedObjOfStrings[docName]].map(ch => ch.charCodeAt())).buffer;
  });
  return binaries;
}