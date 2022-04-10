//HELPER
export default function pStyleTranspile(pStyleFromExcel){
    switch(pStyleFromExcel.trim().toLowerCase()) {
      case 'n' : return {main:"Normal"}; break;
      case 'p0': return {main:"llqPara0"}; break;
      case 'p1': return {main:"llqPara1"}; break;
      case 'p2': return {main:"llqPara2"}; break;
      case 'p3': return {main:"llqPara3"}; break;
      case 'h1': return {main:"llqHeading1"}; break;
      case 'h2': return {main:"llqHeading2"}; break;
      case 'h3': return {main:"llqHeading3"}; break;
      case 'c1': return {main:"llqConsiderations"}; break;
      case 'l1a': return {main:"llqListSimple1"}; break;
      case 'l1i': return {main:"llqListSimple1i"}; break;
      case 'l2i': return {main:"llqListSimple2i"}; break;
      case 'lb1': return {main:"llqListBullet1"}; break;
      case 'ld0': return {main:"llqListDash0"}; break;
      case 'ld1': return {main:"llqListDash1"}; break;
      case 'ld2': return {main:"llqListDash2"}; break;
      case 'ld3': return {main:"llqListDash3"}; break;
      default: return {main:pStyleFromExcel.replace(/ /g, '')};
    }
  }