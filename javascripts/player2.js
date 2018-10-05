define(function(require,exports){
    console.log('main.js执行');
    var dataFormat = require("./dataFormat");
    console.log('123');
})
    class  Player{  //创建一个单例
        constructor(){
            if(Player.instance) return Player.instance;
            return this.getInstance(...arguments);
        }
        getInstance(){
            let instance = new PlayerCreator(...arguments);
            Player.instance = instance;
            return instance;
        }
    }

    class Musics{
        constructor(){
            this.songs = [
                //名字 歌手 小图片 大图片
                { id: 1, title: '丑八怪', singer: '薛之谦', songUrl: './songs/丑八怪 - 薛之谦.mp3', imageUrl: './images/songs/choubaguai.jpg' },
                { id: 2, title: '绅士', singer: '薛之谦', songUrl: './songs/绅士 - 薛之谦.mp3', imageUrl: './images/songs/shenshi.jpg' },
                { id: 3, title: '认真的雪', singer: '薛之谦', songUrl: './songs/认真的雪 - 薛之谦.mp3', imageUrl: './images/songs/renzhendexue.jpg' },
                { id: 4, title: '演员', singer: '薛之谦', songUrl: './songs/演员 - 薛之谦.mp3', imageUrl: './images/songs/yanyuan.jpg' }
            ]
        }
        getSongByNum(index){
            return this.songs[index];
        }
    }

    class PlayerCreator{  //真正的播放器类
        constructor(){
            this.audio = document.querySelector('.music-player__audio');
            this.audio.volume = 0.8;
            this.musics = new Musics();
            this.song_index = 0; //歌曲的index
            this.disc = {
                img:$('.music-player__image'),
                pointer:$('.music-player__pointer')
            }
            this.songList = $('.music-player__list');
            this.loop_style = 0;//循环模式
            this.song_time = {
                current:$('.song-time-current'),
                end:$('.song-time-end')
            }
            this.dataFormat = new DataFormat();
            this.init();
        }
        init(){
            console.log(this.dataFormat);
            this.changeStyleBySong();
            this.renderSongList();
            this.bindEventListener();
            console.log(this.a);
        }
        //根据歌曲渲染界面
        changeStyleBySong(){
            let {title,singer,songUrl,imageUrl} = this.musics.getSongByNum(this.song_index);
            this.audio.src = songUrl;
            $('.music__info--title').html(title);
            $('.music__info--singer').html(singer);
            $('.music-player__image').find('img').prop('src',imageUrl);
            $('.music-player__blur').css("backgroundUrl",imageUrl);
        }
        //歌曲列表
        renderSongList(){
            var str = '';
            this.musics.songs.forEach((item)=>{
                str += `<li class="music__list__item ">${ item.title }</li>`
            })
            this.songList.html(str);
        }
        //各种事件绑定
        bindEventListener(){
            //播放暂停
            this.$play = new Btns('.player-control__btn--play',{click:this.handlePlayAndPause.bind(this)});
            //preSong
            this.$pre = new Btns('.player-control__btn--prev',{click:this.changeSong.bind(this,'pre')});
            //nextSong
            this.$next = new Btns('.player-control__btn--next',{click:this.changeSong.bind(this,'next')});
            //点击切换循环模式
            this.$loop = new Btns('.player__song--circulation',{click: this.loopType.bind(this)});
            //静音
            this.$mute = new Btns('.control__volume--icon',{ click: this.mute.bind(this)});
            //控制音量的进度条
            new ProgressBar('.control__volume--progress',{min:0,max:1,value:this.audio.volume,hander:(value)=>{
                this.audio.volume = value;
            }});
            //控制播放进度条 duration 歌曲播放的时长  currentTime 当前播放的值
            // oncanplay 能播放时触发
            this.audio.oncanplay = () => {
                if(this.progress) {
                    this.song_time.end.html(this.dataFormat.util(this.audio.duration));
                    this.progress.max = this.audio.duration;
                    return false;
                }
                this.progress = new ProgressBar('.player__song--progress',{min:0,max:this.audio.duration,value:0,hander:(value)=>{
                    this.audio.currentTime = value;
                }})
                this.song_time.end.html( this.dataFormat.util(this.audio.duration));
            }
            this.audio.ontimeupdate = ()=>{  //播放时一直触发
                this.progress.setValue( this.audio.currentTime);
                this.song_time.current.html(  this.dataFormat.util(this.audio.currentTime) );
                if(this.audio.currentTime===this.audio.duration){                
                    this.changeSong('next');
                    this.audio.play();
                }            
            }
            
            //点击列表 切换歌曲
            this.songList.on('click','li',(e)=>{
                //点击得到当前li的索引
                var listIndex = $(e.target).index();
                this.changeSong(listIndex);
            })
        }
        //改变歌曲引索值 number next pre 
        changeSongIndex(type){
            if(typeof type === 'number'){
                this.song_index = type;
            }else{
                if( this.loop_style === 0 ){  //列表循环
                    this.song_index += (type==="pre"?-1:1);
                    if(this.song_index<0) this.song_index = this.musics.songs.length - 1;
                    if(this.song_index>(this.musics.songs.length - 1)) this.song_index = 0;
                }else if (this.loop_style === 1) {  //随机
                    do {
                        var _random = parseInt(Math.random()*this.musics.songs.length);
                    } while (_random == this.song_index);
                    this.song_index = _random;
                } else if (this.loop_style === 2) {  //单曲循环
                    this.song_index=this.song_index;
                }
            }
        }
        //切歌  
        changeSong(type){
            let _is_pause = this.audio.paused;  //需要记录播放器的状态
            this.changeSongIndex(type);
            this.changeStyleBySong();
            if(!_is_pause){
                this.audio.play();
            }
        }
        //播放暂停
        handlePlayAndPause(){
            const $playIcon = this.$play.$el.find('i');
            // this.audio.paused 值为true说明目前是不播放
            if(this.audio.paused){  //表示暂停 
                $playIcon.addClass('icon-pause').removeClass('icon-play');
                this.audio.play();
                this.disc.img.addClass('play');
                this.disc.pointer.addClass('play');
            }else{
                $playIcon.addClass('icon-play').removeClass('icon-pause');
                this.audio.pause();
                this.disc.img.removeClass('play');
                this.disc.pointer.removeClass('play');
            }
        }
        //静音
        mute () {
            //判断是不是静音
            if(this.audio.muted){ // true是静音
                this.$mute.$el.find('i').addClass('icon-volume').removeClass("icon-muted");
                this.audio.muted = false;
            }else{ //先切换图片
                this.$mute.$el.find('i').removeClass('icon-volume').addClass("icon-muted");
                this.audio.muted = true;
            }
        }
        //循环
        loopType(){
            this.loop_style = (++this.loop_style)%3;  //每点击一次加一
            if(this.loop_style === 0){  
                this.$loop.$el.find('i').removeClass('icon-single').addClass('icon-loop');
            }else if(this.loop_style === 1){
                this.$loop.$el.find('i').removeClass('icon-loop').addClass('icon-random');
            }else if(this.loop_style === 2){
                this.$loop.$el.find('i').removeClass('icon-random').addClass('icon-single');
            }
            this.changeSongIndex();
        }

    }

    //进度条类
    class ProgressBar{
        constructor(selector,options){
            $.extend(this,options);
            this.$el = $(selector);
            this.width = this.$el.width();
            this._distance;
            this.init();
        }
        init(){
            this.createDomEle();
            this.bindEvents();
            this.changeStyle((this.width*this.value)/(this.max-this.min));
        }
        setValue(value){
            let _x = (this.width*value)/(this.max-this.min);
            this.changeStyle(_x);
        }
        //添加小点和进度条
        createDomEle(){
            this.$back = $('<div class="back">');
            this.$pointer = $('<div class="pointer">');
            this.clientX;
            this.$el.append(this.$back);
            this.$el.append(this.$pointer);
        }
        //点击事件
        bindEvents(){       
            //通過判斷target來判斷是點擊還是拖拽
            $(document).on('mouseup',(e)=>{  //當鼠標抬起沒有在pointer上時 是點擊
                if(e.target == this.$el.get(0) || e.target == this.$back.get(0)){
                    var _x = e.offsetX;  //记录鼠标的位置 相当于进度条背景的宽度
                    var _value = ((this.max - this.min)*_x)/this.width;  //实际音量的值
                    this.changeStyle(_x);
                    this.hander(_value);
                }
                document.onmousemove = null;
            })
            
            this.$el.on('mousedown','div',(e)=>{  //當鼠標按下在pointer上時是拖拽
            if(e.target == this.$pointer.get(0)){
                var mousePos = {
                        x:e.offsetX,
                        y:e.offsetY
                    }
                    document.onmousemove = (e)=>{
                        // if(e.target == this.$el.get(0)){
                        //     return;
                        // }
                        var _left = e.clientX - mousePos.x;
                        var _leftoffset = getPagePosition (this.$back.get(0));
                        this._distance = Math.max(0,Math.min(this.width - this.$pointer.width(),_left-_leftoffset.pagesX));
                        this.$pointer.css('left',this._distance + "px");
                        this.$back.width(this._distance);
                        this.hander((this._distance*(this.max-this.min)/this.width));
                    }
            }
            })
        }
        //改变样式
        changeStyle(num){
            this.$back.width(num);
            this.$pointer.css('left',(num-3) + 'px');
        }
    } 

    //按钮类
    class Btns{
        constructor(selector,handers){
            this.$el = $(selector);
            this.bindEvents(handers);
        }
        bindEvents(handers){
            for (const event in handers) {
                if (handers.hasOwnProperty(event)) {
                    this.$el.on(event,handers[event]);  //取出事件的属性值 直接执行函数
                }
            }
        }
    }
    new Player();

    function getPagePosition(target){
        var sumLeft = target.offsetLeft;
        var sumTop = target.offsetTop;
        while(target.offsetParent != null){    //获取有定位的父元素
            sumLeft += target.offsetParent.offsetLeft; //自身相对父元素的定位 加上有定位的父元素相对于页面或者其他元素的定位
            sumTop += target.offsetParent.offsetTop;  
            
            target = target.offsetParent;
        }
        return {
            pagesX:sumLeft,  //之间返回一个对象
            pagesY:sumTop
        };
    }


