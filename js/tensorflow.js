function makeCode(layers) {
    var code = [], layerCodeLookup = [
        inputLayerCoder,
        convLayerCoder,
        reluLayerCoder,
        poolLayerCoder,
        fcLayerCoder,
        outputLayerCoder
    ];

    var outputName = (function(){
        var i = 0, PREFIX = 'x';
        return {
            get : function(){
                return PREFIX + i;
            },
            getNew : function(){
                i++;
                return this.get();
            }
        }
    }());

    function format(template) {
        var text = template,
            args = Array.prototype.slice.call(arguments);
        args.shift();

        args.forEach(function(arg, i){
           text = text.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
        });

        return text;
    }

    function inputLayerCoder(layer) {
        return format("{0} = tf.placeholder(tf.float32, shape=[None, {1}])",
            outputName.get(), layer.w * layer.h * layer.d);
    }

    function convLayerCoder(layer, prevLayer) {
        var prevName = outputName.get(),
            name1 = outputName.getNew(),
            name2 = outputName.getNew(),
            name3 = outputName.getNew();

        return [
            format("{0} = tf.reshape({1}, [-1,{2},{3},{4}])",
                name1, prevName, prevLayer.w, prevLayer.h, prevLayer.d),

            format("{0} = tf.Variable(tf.truncated_normal([{1}, {2}, {3}, {4}], stddev=0.1))",
                name2, layer.structure.patchHeight, layer.structure.patchWidth, prevLayer.d, layer.structure.outputCount),

            format("{0} = tf.nn.conv2d({1}, {2}, strides=[1, {3}, {4}, 1], padding='{5}')",
                name3, name1, name2, layer.structure.strideHeight, layer.structure.strideWidth,
                layer.structure.zeroPaddingHeight + layer.structure.zeroPaddingWidth ? 'SAME' : 'VALID')
        ];
    }

    function reluLayerCoder(layer, prevLayer){
        var prevName = outputName.get(),
            name1 = outputName.getNew(),
            name2 = outputName.getNew();

        return [
            format("{0} = tf.Variable(tf.constant(0.1, shape=[{1}]))",
                name1, prevLayer.d),

            format("{0} = tf.nn.relu({1} + {2})",
                name2, prevName, name1)
        ];
    }

    function poolLayerCoder(layer){
        var prevName = outputName.get(),
            name1 = outputName.getNew();

        return format("{0} = tf.nn.max_pool({1}, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')",
            name1, prevName);
    }

    function fcLayerCoder(layer, prevLayer){
        var prevName = outputName.get(),
            name1 = outputName.getNew(),
            name2 = outputName.getNew(),
            name3 = outputName.getNew();

        return [
            format("{0} = tf.Variable(tf.truncated_normal([{1}, {2}], stddev=0.1))",
                name1, prevLayer.h * prevLayer.w * prevLayer.d, layer.h * layer.w * layer.d),

            format("{0} = tf.reshape({1}, [-1, {2}])",
                name2, prevName, prevLayer.h * prevLayer.w * prevLayer.d),

            format("{0} = tf.matmul({1}, {2})",
                name3, name2, name1)
        ];
    }

    function outputLayerCoder(layer, prevLayer){
        return fcLayerCoder(layer, prevLayer);
    }

    var prevLayer;
    layers.forEach(function(layer){
        code = code.concat(layerCodeLookup[layer.type](layer, prevLayer), '');
        prevLayer = layer;
    });

    return code.join('\n');
}