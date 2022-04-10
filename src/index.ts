import { makeDocx } from "./docxTemplater";
import { StringToArrayBuffer } from "./docxStorage";

if( document.getElementById('outputTemplates') !== null ) startObserver();
function startObserver(){
    //Use MutationObserver to start DocxGen
    const resultNode = document.getElementById('resultStorage');
    if(resultNode !==null){
        //Observer, trickers when output is ready
        const mCall = function (mutationsList, observer) {
            for (const mutation of mutationsList) { 
                if (mutation.type === 'childList' && JSON.parse(resultNode.innerHTML)) { 
                    let engineResult = JSON.parse(resultNode.innerHTML);
                    //DOCX
                    if (Array.isArray(engineResult)
                        && document.getElementById('outputTemplates')) {

                        //DOCX, but only when binaries (ie Docx templates) are loaded
                        let docxInArray = engineResult.filter( e => typeof e['docx'] !== 'undefined'); //check for any docx, not only first line
                        if(docxInArray.length>0){ 
                            //@ts-ignore    only forward rule lines with 'docx' 
                            makeDocx(docxInArray, StringToArrayBuffer(document.getElementById('outputTemplates').innerHTML));
                        }
                    } 
                } 
            }
        };
        new MutationObserver(mCall).observe(resultNode, { childList: true });
    }
    else(console.error("Invalid HTML, result div is missing"));
}
export {makeDocx, StringToArrayBuffer};