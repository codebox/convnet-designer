function buildNetwork() {
    "use strict";

    var layers = [],
        BYTES_PER_VALUE = 4;

    function buildLayer(w, h, d, weights) {
        return {
            w: w,
            h: h,
            d: d,
            weights : weights
        };
    }

    function setLayerColours(layer, lineColour, planeColour) {
        layer.lineColour  = lineColour;
        layer.topColour   = planeColour;
        layer.rightColour = planeColour;
        layer.faceColour  = planeColour;
    }

    function addLayer(w, h, d, weights, lineColour, planeColour) {
        var layer = buildLayer(w, h, d, weights);

        setLayerColours(layer, lineColour, planeColour);

        layers.push(layer);
    }

    function getPreviousLayer() {
        return layers[layers.length - 1];
    }

    function isNotInt(n) {
        return Math.floor(n) !== n;
    }

    return {
        withInputLayer : function(w, h, d) {
            if (layers.length) {
                throw new Error('Input layer must be the first layer to be added');
            }
            addLayer(w, h, d, 0, '#5B6F9C', '#acc6ee');
            return this;
        },

        withConvLayer : function(patchWidth, patchHeight, strideWidth, strideHeight, zeroPaddingWidth, zeroPaddingHeight, outputCount) {
            var previousLayer = getPreviousLayer(),
                wn = (previousLayer.w - patchWidth + 2 * zeroPaddingWidth),
                w  = 1 + wn / strideWidth,
                hn = (previousLayer.h - patchHeight + 2 * zeroPaddingHeight),
                h  = 1 + hn / strideHeight,
                d  = outputCount;

            if (isNotInt(w)) {
                throw new Error(["Bad strideWidth value:", strideWidth, "is not a factor of", wn].join(' '));
            }

            if (isNotInt(h)) {
                throw new Error(["Bad strideHeight value:", strideHeight, "is not a factor of", hn].join(' '));
            }

            addLayer(w, h, d, previousLayer.d * patchWidth * patchHeight * outputCount, '#679FAD', '#acdbee');

            return this;
        },

        withRelu : function(){
            var previousLayer = getPreviousLayer();

            addLayer(previousLayer.w, previousLayer.h, previousLayer.d, 0, '#8C709E', '#d4acee');

            return this;
        },

        withPooling : function(poolWidth, poolHeight, strideWidth, strideHeight) {
            var previousLayer = getPreviousLayer(),
                wn = (previousLayer.w - poolWidth),
                w  = 1 + wn / strideWidth,
                hn = (previousLayer.h - poolHeight),
                h  = 1 + hn / strideHeight;

            if (isNotInt(w)) {
                throw new Error(["Bad strideWidth value:", strideWidth, "must be a factor of", wn].join(' '));
            }

            if (isNotInt(h)) {
                throw new Error(["Bad strideHeight value:", strideHeight, "must be a factor of", hn].join(' '));
            }

            addLayer(w, h, previousLayer.d, 0, '#AD7856', '#F7AD83');

            return this;
        },

        withFullyConnectedLayer : function(w, h, d) {
            var previousLayer = getPreviousLayer();

            addLayer(w, h, d, previousLayer.w * previousLayer.h * previousLayer.d * w * h * d, '#CDD03F', '#edeeac');

            return this;
        },

        withOutputLayer : function(classCount) {
            var previousLayer = getPreviousLayer();

            addLayer(1, 1, classCount, previousLayer.w * previousLayer.h * previousLayer.d * classCount, '#5AAB50', '#b3eeac');

            return this;
        },

        getLayers : function() {
            return layers;
        },

        getParameterCount : function() {
            return layers.reduce(function(total,layer){
                return layer.weights + total;
            }, 0);
        },

        getMemoryRequirement : function() {
            return layers.reduce(function(total, layer){
                return (layer.w * layer.h * layer.d) + total;
            }, 0) * BYTES_PER_VALUE;
        },

        utils : {
            calcZeroPadding : function(inputSize, patchSize, stride) {
                function isEven(n){
                    return n % 2 === 0;
                }
                if (patchSize > inputSize) {
                    throw new Error('Patch size must not exceed input size');
                }

                var n = (inputSize - patchSize) % stride;
                if (n===0) {
                    return 0;
                }

                if (isEven(stride)) {
                    if (isEven(n)) {
                        return (stride - n) % stride / 2;
                    } else {
                        return; // won't fit
                    }
                } else {
                    return (n * (stride - 1) / 2) % stride;
                }
            }
        }
    };

}
