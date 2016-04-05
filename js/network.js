function buildNetwork(inputLayer) {
    "use strict";

    var layers = [];

    function buildLayer(w, h, d, weights) {
        return {
            w: w,
            h: h,
            d: d,
            weights : weights
        };
    }

    function addLayer(w, h, d, weights) {
        layers.push(buildLayer(w, h, d, weights));
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
            addLayer(w, h, d, 0);
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

            addLayer(w, h, d, previousLayer.d * patchWidth * patchHeight * outputCount);

            return this;
        },

        withRelu : function(){
            var previousLayer = getPreviousLayer();

            addLayer(previousLayer.w, previousLayer.h, previousLayer.d, 0);

            return this;
        },

        withPooling : function(poolHeight, poolWidth, strideWidth, strideHeight) {
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

            addLayer(h, w, previousLayer.d, 0);

            return this;
        },

        withFullyConnectedLayer : function(w, h, d) {
            var previousLayer = getPreviousLayer();

            addLayer(w, h, d, previousLayer.w * previousLayer.h * previousLayer.d * w * h * d);

            return this;
        },

        withOutputLayer : function(classCount) {
            return this.withFullyConnectedLayer(1, 1, classCount);
        },

        getLayers : function() {
            return layers.map(function(layer){
                return buildLayer(layer.w, layer.h, layer.d, layer.weights);
            });
        }
    };

}
