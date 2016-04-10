function buildNetwork() {
    "use strict";

    var layers = [],
        BYTES_PER_VALUE = 4;

    function buildLayer(type, w, h, d, weights, structure) {
        return {
            w: w,
            h: h,
            d: d,
            type: type,
            weights : weights,
            structure : structure,
            size : function(){
                return this.w * this.h * this.d;
            }
        };
    }

    function addLayer(type, w, h, d, weights, structure) {
        var layer = buildLayer(type, w, h, d, weights, structure);

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
            addLayer(0, w, h, d, 0);
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

            addLayer(1, w, h, d, previousLayer.d * patchWidth * patchHeight * outputCount, {
                patchWidth        : patchWidth,
                patchHeight       : patchHeight,
                strideWidth       : strideWidth,
                strideHeight      : strideHeight,
                zeroPaddingWidth  : zeroPaddingWidth,
                zeroPaddingHeight : zeroPaddingHeight,
                outputCount       : outputCount
            });

            return this;
        },

        withRelu : function(){
            var previousLayer = getPreviousLayer();

            addLayer(2, previousLayer.w, previousLayer.h, previousLayer.d, 0);

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

            addLayer(3, w, h, previousLayer.d, 0);

            return this;
        },

        withFullyConnectedLayer : function(w, h, d) {
            var previousLayer = getPreviousLayer();

            addLayer(4, w, h, d, previousLayer.w * previousLayer.h * previousLayer.d * w * h * d);

            return this;
        },

        withOutputLayer : function(classCount) {
            var previousLayer = getPreviousLayer();

            addLayer(5, 1, 1, classCount, previousLayer.w * previousLayer.h * previousLayer.d * classCount);

            return this;
        },

        getLayers : function() {
            return layers;
        },

        getLastLayer : function() {
            return layers[layers.length-1];
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
