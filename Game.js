var images;
var letterCount;

var canvas;
var ctx;
var width;
var height;
var halfWidth;
var halfHeight;

var images;
var successCount;

var letters;

var delta;
var old;
var starting;

var middle;

var imageSize;
var badge;

var twitter;
var facebook;
var google;

var doneLoading;

var doneLetters;
var doneImages;

var randomPool;

function Initialize() {
    width = window.innerWidth - 15;
    height = window.innerHeight - 45;
    halfWidth = width*0.5;
    halfHeight = height*0.5;
    starting = 0;
    letterCount = 0;
    letterSize = height * 0.0625;

    images = [];
    imageSize = height *0.6;
    successCount = 0;

    letters = [];
    middle = halfWidth + letterSize * 0.5;
    doneLoading = false;
    doneLetters = false;
    doneImages = false;
    old = null;
    LoadContent();

    Pace.restart();

    Pace.on('hide', function() {
         doneLoading = true;
         TryUpdating();
    });
}

function TryUpdating(){
    if(doneLoading && doneLetters && doneImages && old === null){
        old = Date.now();
        update();
    }
}

function getNumber(){
    if (randomPool.length === 0) {
        throw "No numbers left";
    }
    var index = Math.floor(randomPool.length * Math.random());
    var drawn = randomPool.splice(index, 1);
    return drawn[0];
}
function LoadContent() {
    var str = "spellcheese";
    var colors = "roygb";
    drawCanvas();
    randomPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for(var j=0; j<str.length; j++){
        addLetter(str.charAt(j) + "s" + colors.charAt(Math.floor(Math.random() * 5)), getNumber(), j);
    }
    addImage('roboFrame', 0);
    addImage('deviceFrame', 1);
    
    addBadge();
    addTwitter();
    addLinks();
}

function drawCanvas() {
    
    canvas = document.createElement('canvas');

    canvas.setAttribute("id", "canvas");

    canvas.width = width;
    canvas.height = height;

    document.body.appendChild(canvas);

    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
}

function Item(l){
    this.name = l;

}

Item.prototype.setPosition = function(){
    this.top = this.posY - this.size * 0.5;
    this.bottom = this.posY + this.size * 0.5;
    this.left = this.posX - this.size * 0.5;
    this.right = this.posX + this.size * 0.5;
};

Item.prototype.draw = function(){
    ctx.drawImage(this.image, this.left, this.top, this.size, this.size);
};

function update(){
    delta = Date.now()- old;
    old = Date.now();
    //ctx.clearRect(0, height * 0.4 + letterSize * 4, width, height);
    if(!letters[starting].done)
        moveLetter(starting);
    else if( starting < letters.length-1)
        starting++;
    else if(starting >= letters.length-1){
        if(!images[1].done){
            
            moveImages();
        } else if(!twitter.done){
            moveTwitter();
        } else if(!badge.done){
            moveBadge();
        }
    }
    if(!badge.done)
    {
        draw();
    }
}

function draw(){
    
    ctx.clearRect(0, 0, width, height);
    for(var i = 0; i<letters.length; i++){
        letters[i].draw();
    }
    for(var j = 0; j<images.length; j++){
        images[j].draw();
    }
    //badge.draw();

    requestAnimFrame(update);
}

function addLetter(letter, index, index2){
    var letterItem = new Image();
    //letterItem.id =letter.charAt(0)+letters.length;
    letterItem.src = 'Letters/' + letter + '.png';
    letterItem.addEventListener("load", function () {
        letterCount++;
        var toClick = new Item(letter.charAt(0));
        toClick.image = letterItem;
        if(index2 < 5) //divide this per word
        {
            toClick.originalY = height * 0.4 + letterSize * 5.25;
            toClick.originalX = middle + letterSize*(index2 - 2.5);
        }
        else{
            toClick.originalY = height * 0.4 + letterSize * 6.75;
            toClick.originalX = middle+ letterSize*(index2-8);
        }
        if(index < 5){
            toClick.posY = height * 0.4 + letterSize * 7.75;
            toClick.posX = middle + letterSize*(index-2.5);
        } else{
            toClick.posY = height * 0.4 + letterSize * 9.25;
            toClick.posX = middle+ letterSize*(index-8);
        }
        toClick.size = letterSize;
        toClick.done = false;
        toClick.setPosition();
        toClick.draw();
        letters[index2] = toClick;

        if(11 === letterCount){
            doneLetters = true;
            TryUpdating();
        }
    }, false);
}

function moveLetter(index){
    var letter = letters[index];
    var distance = Math.sqrt(Math.pow(letter.originalX-letter.posX,2)+Math.pow(letter.originalY-letter.posY,2));
    var directionX = (letter.originalX-letter.posX) / distance;
    var directionY = (letter.originalY-letter.posY) / distance;
    //var speed = distance * 0.015625;
    var speed = 0.6;
    letters[index].posX += directionX * delta * speed;
    letters[index].posY += directionY *delta * speed;
    if(Math.abs(letters[index].posX - letters[index].originalX) < directionX*delta*speed +1){
        letters[index].posX = letters[index].originalX;
        letters[index].posY = letters[index].originalY;
        letters[index].done = true;
    }
    letters[index].setPosition();
}

function addImage(name, index){

    var imageItem = new Image();
    imageItem.src = 'Images/' + name + '.png';
    //imageItem.id = 'i'+images.length;

    imageItem.addEventListener("load", function () {
        successCount++;
        var item = new Item(name);

        item.image = imageItem;
        item.size = imageSize;
        
        //item.posX = halfWidth + (images.length*2-1)*imageSize*0.0625;
        item.posX = halfWidth + index*imageSize*0.03125;
        item.posY = halfHeight - letterSize * 2.5- index*imageSize;
        item.originalX = item.posX;
        item.done = false;

        images[index] = item;

        if(2 === successCount){
            images[0].setPosition();
            images[0].draw();
            doneImages = true;
            TryUpdating();
        }
    }, false);

}

function moveImages(){
    //images[0].posX -= delta;
    
    var dist = Math.abs(images[1].posY - (halfHeight - letterSize*2));
    var speed = delta*dist*0.006;
    //moveTwitter(speed);
    if(!images[0].done){
        //alert(Math.abs(images[0].posX - halfWidth + imageSize*0.03125));
        if(Math.abs(images[0].posX - halfWidth + imageSize*0.03125) < delta * 0.1){
            images[0].posX = halfWidth - imageSize*0.03125;
            images[0].done = true;
        } else{
            images[0].posX -= delta *0.1;
            //alert('happen');
        }
        
        images[0].setPosition();
    }
    // var distance = Math.sqrt(Math.pow(images[1].posY-halfHeight + letterSize*2,2));
    
    images[1].posY += speed;
    if( speed < delta*0.006){
        images[1].posY =halfHeight - letterSize*2;
        
        images[1].setPosition();
        images[1].done = true;
        ctx.clearRect(0, 0, width, height);
        for(var i = 0; i<letters.length; i++){
            letters[i].draw();
        }
        for(var j = 0; j<images.length; j++){
            images[j].draw();
        }
    }
    
    images[1].setPosition();
}

requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 16);
    };
})();

function addLink(text, link){
    var a = document.createElement('a');
    var t = document.createTextNode(text);
    a.appendChild(t);
    a.href = link;
    a.id = text;
    a.style.fontSize = "16px";
    a.style.color = "#FFFFFF";
    //a.style.fontSize = width * 0.01 + "px";
    document.body.appendChild(a);
}

function addLinks(){
    addLink('Privacy • ', 'privacy/');
    addLink('• Contact', 'javascript:Contact()');
    
}

function Contact(){
    var c = document.getElementById('• Contact');
    if(c.innerHTML === 'contact@spellcheese.com')
        c.innerHTML = '• Contact';
    else
        c.innerHTML = 'contact@spellcheese.com';
}

window.addEventListener('resize', fixSize, false);
window.addEventListener('orientationchange', fixSize, false);
//window.addEventListener('resize:end', fixSize, false);

function fixSize () {
    badge.done = true;
    
    document.body.removeChild(canvas);
    document.body.removeChild(document.getElementById('Privacy • '));
    document.body.removeChild(document.getElementById('• Contact'));
    width = window.innerWidth - 15;
    height = window.innerHeight - 45;
    halfWidth = width*0.5;
    halfHeight = height*0.5;
    letterSize = height * 0.0625;
    imageSize = height *0.6;
    middle = halfWidth + letterSize * 0.5;

    canvas.width = width;
    canvas.height = height;

    document.body.appendChild(canvas);
    addLinks();

    skipAnimation();

}


var scaleBadgeImage;
function addBadge(){
    var a = document.createElement('a');
    var img = new Image();
    //img.style.width = height * 0.35 + 'px';
    //img.style.height = height*0.1037 + 'px';
    // img.style.width = '0px';
    // img.style.height = '0px';
    img.src = 'Images/badge.svg';
    img.id = 'badgeImg';
    scaleBadgeImage = img;
    // img.position ='absolute';
    a.appendChild(img);
    a.href = 'http://www.google.com';
    a.id = 'Badge';
    a.style.position='absolute';

    //a.posY = height *0.954798;
    a.posY =  0;

    a.style.top = height*0.8963 + 'px';
    a.style.left = halfWidth + 'px';
    a.done = false;
    a.added = false;
    badge = a;
}



function moveBadge(){
    // badge.posY += delta *0.2;
    if(!badge.added){
        //document.body.appendChild(badge);
        badge.added = true;
    }
    // if(Math.abs(badge.posY - height*0.8963) < delta * 0.2){
    //     badge.done = true;
    //     badge.posY = height*0.8963;
    // }
    // badge.style.top = badge.posY + 'px';

    badge.posY += delta*2;
    if(badge.posY + delta*2 > height){
        badge.posY = height;
        badge.done = true;
    } else{

        
        scaleBadgeImage.style.width = badge.posY * 0.35 + 'px';
        scaleBadgeImage.style.height = badge.posY * 0.1037 + 'px';
        badge.style.left = halfWidth - badge.posY * 0.165 + 'px';
    }
    
}

function skipAnimation(){

    for (var i = 0; i< letters.length; i++) {
        letters[i].size = letterSize;


        if(i < 5) //divide this per word
        {
            letters[i].posY = height * 0.4 + letterSize * 5.5;
            letters[i].posX = middle + letterSize*(i-2.5);
        }
        else{
            letters[i].posY = height * 0.4 + letterSize * 7;
            letters[i].posX = middle+ letterSize*(i-8);
        }
        letters[i].setPosition();
        letters[i].draw();
    }


    images[0].size = imageSize;
    images[0].posY = halfHeight - letterSize * 2.5;
    images[0].posX = halfWidth - imageSize*0.03125;
    images[0].done = true;
    images[0].setPosition();
    images[0].draw();

    images[1].size = imageSize;
    images[1].posY = halfHeight - letterSize*2;
    images[1].posX = halfWidth + imageSize*0.03125;
    images[1].setPosition();
    images[1].draw();

    if(!badge.added){
        document.body.appendChild(badge);
        badge.added = true;
    }

    badge.style.top = height * 0.8963 + 'px';
    badge.style.left = halfWidth - height*0.165 + 'px';

    //var img = document.getElementById('badgeImg');
    scaleBadgeImage.style.width = height * 0.35 + 'px';
    scaleBadgeImage.style.height = height * 0.1037 + 'px';

    if(!twitter.added){
        document.body.appendChild(twitter);
        document.body.appendChild(facebook);
        document.body.appendChild(google);
        twitter.added = true;
    }
    var h06 = height * 0.6 + 'px';
    var h006 = height * 0.06 + 'px';
    twitter.style.top = h06;
    twitter.style.left = halfWidth + 'px';

    //var tI = document.getElementById('twitterImg');
    tI.style.width = h006;
    tI.style.height = h006;

    facebook.style.top = h06;
    facebook.style.left = halfWidth -height*0.12+ 'px';

    //var fI = document.getElementById('facebookImg');
    fI.style.width = h006;
    fI.style.height = h006;

    google.style.top = h06;
    google.style.left = halfWidth + height*0.12+ 'px';

    //var gI = document.getElementById('googleImg');
    gI.style.width = h006;
    gI.style.height = h006;

}

var tI, fI, gI;

function addTwitter(){
    var iconSize = 0;
    var yPos = height*0.6;

    var a = document.createElement('a');
    var img = new Image();
    img.style.width = iconSize + 'px';
    img.style.height = iconSize + 'px';
    img.src = 'Images/twitter.svg';
    tI = img;
    img.position ='absolute';
    a.appendChild(img);
    a.href ='https://twitter.com/home?status=Check this out! ' + document.URL;
    a.id = 'Twitter';
    a.style.position='absolute';

    a.posY =0;

    // a.style.top = yPos + 'px';
    // a.style.left = halfWidth + 'px';

    a.done = false;
    a.added = false;
    twitter = a;

    var b = document.createElement('a');
    var img2 = new Image();
    img2.style.width = iconSize + 'px';
    img2.style.height = iconSize + 'px';
    img2.src = 'Images/facebook.svg';
    fI = img2;
    img2.position ='absolute';
    b.appendChild(img2);
    b.href = 'https://www.facebook.com/sharer/sharer.php?u=' + document.URL;
    b.id = 'facebook';
    b.style.position='absolute';

    b.posY =0;

    // b.style.top = yPos + 'px';
    // b.style.left = halfWidth -height*0.12+ 'px';

    b.done = false;
    b.added = false;
    facebook = b;

    var c = document.createElement('a');
    var img3 = new Image();
    img3.style.width = iconSize + 'px';
    img3.style.height = iconSize + 'px';
    img3.src = 'Images/google.svg';
    gI = img3;
    img3.position ='absolute';
    c.appendChild(img3);
    c.href ='https://plus.google.com/share?url=' + document.URL;
    c.id = 'google';
    c.style.position='absolute';

    c.posY =0;

    // c.style.top = yPos + 'px';
    // c.style.left = halfWidth +height*0.12+ 'px';

    c.done = false;
    c.added = false;
    google = c;
}

function moveTwitter(){
    var speed = delta*0.6;
    if(!twitter.added){
        document.body.appendChild(twitter);
        document.body.appendChild(facebook);
        document.body.appendChild(google);
        twitter.added = true;
    }

    if(twitter.posY > height*0.06){
        twitter.posY = height*0.06;
        twitter.done = true;
    }
    else{
       twitter.posY += speed;
    }

    facebook.style.left = halfWidth -height*0.09-twitter.posY*0.5+  'px';
    twitter.style.left = halfWidth +height*0.03- twitter.posY*0.5+ 'px' ;
    google.style.left = halfWidth +height*0.15-twitter.posY*0.5+ 'px';

    facebook.style.top = height*0.63 -twitter.posY*0.5+  'px';
    twitter.style.top = height*0.63 - twitter.posY*0.5+ 'px' ;
    google.style.top = height*0.63 -twitter.posY*0.5+ 'px';

    var size = twitter.posY + 'px';
    tI.style.width = size;
    fI.style.width = size;
    gI.style.width = size;

    tI.style.height = size;
    fI.style.height = size;
    gI.style.height = size;

    


}