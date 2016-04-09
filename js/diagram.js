var diagram = (function(){
    function makeGrey(n) {
        return ['rgb(', n, ',', n, ',', n, ')'].join('');
    }
    var canvas = document.getElementById('canvas'),
        ctx    = canvas.getContext('2d'),
        H_FRACTION = 0.9,
        W_FRACTION = 0.6,
        ANGLE = Math.PI / 4; // 45 degrees

    function calculateLayerCoords(layer, scale) {
        var backEdgeXOffset = scale * layer.w * Math.cos(ANGLE) /2;
        var backEdgeYOffset = scale * layer.w * Math.sin(ANGLE) /2;

        return {
            'x0': -backEdgeXOffset / 2,
            'x1': scale * layer.d - backEdgeXOffset / 2,
            'x2': backEdgeXOffset / 2,
            'x3': backEdgeXOffset / 2 + scale * layer.d,
            'y0': -scale * layer.h / 2 - backEdgeYOffset / 2,
            'y1': -scale * layer.h / 2 + backEdgeYOffset / 2,
            'y2': scale * layer.h / 2 - backEdgeYOffset / 2,
            'y3': scale * layer.h / 2 + backEdgeYOffset / 2
        }
    }

    function drawLayer(layer, xOffset, scale) {
        ctx.save();

        ctx.strokeStyle = layer.lineColour;
        ctx.translate(xOffset, canvas.height / 2);

        var backEdgeXOffset = scale * layer.w * Math.cos(ANGLE) /2;
        var backEdgeYOffset = scale * layer.w * Math.sin(ANGLE) /2;

        var coords = calculateLayerCoords(layer, scale);

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
        drawQuad(coords.x0, coords.y1, coords.x2, coords.y0, coords.x3, coords.y0, coords.x1, coords.y1, layer.topColour);

        // facing edge
        drawQuad(coords.x0, coords.y1, coords.x0, coords.y3, coords.x1, coords.y3, coords.x1, coords.y1, layer.faceColour);

        // right face
        drawQuad(coords.x1, coords.y1, coords.x3, coords.y0, coords.x3, coords.y2, coords.x1, coords.y3, layer.rightColour);

        ctx.restore();
    }

    return {
        drawLayers : function(layers) {
            function maxProp(arr, propName) {
                return Math.max.apply(this, arr.map(function(o){
                    return o[propName];
                }));
            }
            var xOffset = 0, minX = 999999, minY = 999999, maxX = -1, maxY = -1;
            layers.forEach(function(layer){
                var coords = calculateLayerCoords(layer, 1);
                minX = Math.min(minX, coords.x0 + xOffset, coords.x1 + xOffset, coords.x2 + xOffset, coords.x3 + xOffset);
                maxX = Math.max(maxX, coords.x0 + xOffset, coords.x1 + xOffset, coords.x2 + xOffset, coords.x3 + xOffset);
                minY = Math.min(minY, coords.y0, coords.y1, coords.y2, coords.y3);
                maxY = Math.max(maxY, coords.y0, coords.y1, coords.y2, coords.y3);
                xOffset += layer.h/4 + layer.d;
            });
            var xScale = 0.9 * canvas.width / (maxX - minX);
            var yScale = 0.9 * canvas.height / (maxY - minY);
            var scale = Math.min(xScale, yScale);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            xOffset = canvas.width * 0.05 + (canvas.width - scale * (maxX - minX)) / 2;
            layers.forEach(function(layer, i){
                drawLayer(layer, xOffset, scale);
                xOffset += (layer.h/4 + layer.d) * scale;
            });
        }
    };
}());
