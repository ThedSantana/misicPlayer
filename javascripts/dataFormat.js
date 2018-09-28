class DataFormat{
    constructor(){
        if(DataFormat.instance){
            return DataFormat.instance;
        } 
        return this.getInstance(...arguments);
    }
    getInstance(){
        var instance = {
            util(time){
                if(time === undefined){
                    this.catchError( 123, { method : "util" , para : "time"});
                    return false;
                } 
                var _time = Math.floor(time)
                var _minute = Math.floor(_time/60);
                var _hour = Math.floor(_minute/60);
                var _second = _time - _minute*60;
                return (_hour?this.fillZero(_hour)+":":"")+this.fillZero(_minute-(_hour*60))+":"+this.fillZero(_second);
            },
            fillZero(num){
                if(num === undefined){
                    this.catchError( 123, { method : "fillZero" , para : "num"});
                    return false;
                } 
                return num>9?num:'0'+num;
            },
            error:{
                123:({method,para})=>{  //参数错误状态码
                    return method + " function need a param " + para;
                }
            },
            catchError(code, options){
                console.error( '[DataFormat error] message: '+this.error[code](options));
            }
        }
        DataFormat.instance = instance;
        return instance;
    }
}
//commonjs
if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = DataFormat;
}
//AMD
if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return DataFormat;
	} );
}

console.log(new DataFormat()==new DataFormat());