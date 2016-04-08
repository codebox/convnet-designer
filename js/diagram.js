var diagram = (function(){
    function makeGrey(n) {
        return ['rgb(', n, ',', n, ',', n, ')'].join('');
    }
    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        BLACK = makeGrey(0),
        WHITE = makeGrey(255),
        GREY1 = makeGrey(230),
        GREY2 = makeGrey(250),
        H_FRACTION = 0.9,
        W_FRACTION = 0.6,
        LAYER_SPACING = 40,
        ANGLE = Math.PI / 4; // 45 degrees

    function drawLayer(layer, xOffset, scale) {
        ctx.save();

        ctx.strokeStyle = layer.lineColour || BLACK;
        ctx.translate(xOffset, canvas.height / 2);

        var backEdgeXOffset = scale * layer.w * Math.cos(ANGLE) /2;
        var backEdgeYOffset = scale * layer.w * Math.sin(ANGLE) /2;

        var x0 = -backEdgeXOffset/2,
            x1 = scale * layer.d - backEdgeXOffset/2,
            x2 = backEdgeXOffset/2,
            x3 = backEdgeXOffset/2 + scale * layer.d,

            y0 = -scale * layer.h/2 - backEdgeYOffset/2,
            y1 = -scale * layer.h/2 + backEdgeYOffset/2,
            y2 =  scale * layer.h/2 - backEdgeYOffset/2,
            y3 =  scale * layer.h/2 + backEdgeYOffset/2;


        function drawQuad(p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, color) {
            function moveWithLines() {
                ctx.moveTo(p1x, p1y);
                ctx.lineTo(p2x, p2y);
                ctx.lineTo(p3x, p3y);
                ctx.lineTo(p4x, p4y);
                ctx.lineTo(p1x, p1y);
            }

            ctx.fillStyle = color;

            ctx.beginPath();
            moveWithLines();
            ctx.fill();

            ctx.beginPath();
            moveWithLines();
            ctx.stroke();
        }

        // top edge
        drawQuad(x0, y1, x2, y0, x3, y0,x1, y1, layer.topColour || WHITE);

        // facing edge
        drawQuad(x0, y1, x0, y3, x1, y3, x1, y1, layer.faceColour ||  GREY2);

        // right face
        drawQuad(x1, y1, x3, y0, x3, y2, x1, y3, layer.rightColour || GREY1);

        ctx.restore();
    }

    return {
        drawLayers : function(layers) {
            function maxProp(arr, propName) {
                return Math.max.apply(this, arr.map(function(o){
                    return o[propName];
                }));
            }
            var maxH = maxProp(layers, 'h'),
                maxW = maxProp(layers, 'w') * 2,
                depth = layers.reduce(function(d, layer){
                    return d + layer.d + LAYER_SPACING;
                }, 0),
                hScale = 0.8 * canvas.height / maxH,
                wScale = 0.8 * canvas.width / maxW,
                dScale = 0.8 * canvas.width / depth,
                scale = Math.min(hScale, wScale, dScale);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var xOffset = LAYER_SPACING * 2;
            layers.forEach(function(layer, i){
                drawLayer(layer, xOffset, scale);
                xOffset += LAYER_SPACING + layer.d;
            });
        }
    };
}());


    ////var layers = buildNetwork({h:100, w:100, d:10}).getLayers();
    //var layers =[
    //    {h:200, w:200, d:3},
    //    {h:150, w:150, d:10},
    //    {h:100, w:100, d:30},
    //    {h:60, w:60, d:60},
    //    {h:20, w:20, d:100}];
    //drawLayers(layers);

