
// see http://cs231n.github.io/convolutional-networks/#pool
function buildNetwork(inputLayer) {
    "use strict";

    function buildLayer(w, h, d) {
        return {
            w : w,
            h : h,
            d : d,
            size : function () {
                return this.w * this.h * this.d;
            }
        };
    }

    var layers = [buildLayer(inputLayer.w, inputLayer.h, inputLayer.d)];

    function isNotInt(n) {
        return Math.floor(n) !== n;
    }

    function getPreviousLayer() {
        return layers[layers.length - 1];
    }

    return {
        addConvolution : function (patchWidth, patchHeight, strideWidth, strideHeight, zeroPaddingWidth, zeroPaddingHeight, outputCount) {
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

            layers.push(buildLayer(h, w, d));
        },

        addConvolutionSimple : function (patchSize, stride, zeroPaddingSize, outputCount) {
            this.addConvolution(patchSize, patchSize, stride, stride, zeroPaddingSize, zeroPaddingSize, outputCount);
        },

        addRelu : function () {
            var previousLayer = getPreviousLayer();

            layers.push(buildLayer(previousLayer.h, previousLayer.w, previousLayer.d));
        },

        addPooling : function (poolWidth, poolHeight, strideWidth, strideHeight) {
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

            layers.push(buildLayer(h, w, previousLayer.d));
        },

        addPoolingSimple : function (size) {
            this.addPooling(size, size, size, size);
        },

        addFullyConnected : function (size) {
            layers.push(buildLayer(1, 1, size));
        },

        getLayers : function() {
            var previousLayer;
            return layers.map(function(layer){
                var populatedLayer = buildLayer(layer.w, layer.h, layer.d);

                if (previousLayer) {
                    populatedLayer.i = previousLayer.o;
                } else {
                    populatedLayer.i = layer.size();
                }

                populatedLayer.o = layer.size();
                previousLayer = populatedLayer;
                return populatedLayer;
            });
        }
    };

}
