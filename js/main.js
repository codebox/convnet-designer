$(function(){
    var nextLayerId = 1,
        NUMBER_REGEX = /^[1-9][0-9]*$/;

    function getColour(layerIndex, shade){
        function shadeColor2(color, percent) {
            // Taken from: http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
            var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
            return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
        }

        var LAYER_BASE_COLOURS = ['#acc6ee', '#acdbee', '#d4acee', '#f7ad83', '#edeeac', '#b3eeac'];

        return shadeColor2(LAYER_BASE_COLOURS[layerIndex], shade);
    }

    var updateButtonStates = (function() {
        var addInput  = $('#addInput'),
            addOutput = $('#addOutput'),
            addOthers = $('#addConv,#addRelu,#addPool,#addFc');

        return function(){
            var hasInput  = $('#layers').find('.inputLayer').length,
                hasOutput = $('#layers').find('.outputLayer').length,
                editing   = $('#layers').find('.stateEditable').length;

            if (!hasInput) {
                addInput.prop('disabled', false);
                addOutput.prop('disabled', true);
                addOthers.prop('disabled', true);
            } else if (hasOutput || editing) {
                addInput.prop('disabled', true);
                addOutput.prop('disabled', true);
                addOthers.prop('disabled', true);
            } else {
                addInput.prop('disabled', true);
                addOutput.prop('disabled', false);
                addOthers.prop('disabled', false);
            }
        };
    }());

    function updateDiagramAndCode() {
        var net = buildNetwork();
        $('#layers').find('.layer').each(function() {
            var $layerPanel = $(this);

            $layerPanel[0].updateNet($layerPanel, net);
        });

        var layers = net.getLayers();
        $('#layers').find('.layer').each(function(i) {
            var $layerPanel = $(this),
                layerType = $layerPanel[0].layerType,
                layer = layers[i];

            layer.lineColour  = getColour(layerType, -0.5);
            layer.topColour   = getColour(layerType, 0.8);
            layer.faceColour  = getColour(layerType, 0.4);
            layer.rightColour = getColour(layerType, 0);
        });

        diagram.drawLayers(layers);
        $('#paramCount').text(Number(net.getParameterCount()).toLocaleString());

        function formatMemoryAmount(bytes) {
            function format(val, unit) {
                return Math.floor(val) + ' ' + unit;
            }
            var K = 1024;
            console.log(bytes)
            if (bytes < K) {
                return format(bytes, 'byte');
            }
            if (bytes < K * K) {
                return format(bytes / K, 'KB');
            }
            if (bytes < K * K * K) {
                return format(bytes / (K * K), 'MB');
            }
            return format(bytes /(K * K * K), 'GB');
        }
        $('#memUsage').text(formatMemoryAmount(net.getMemoryRequirement()));

        var code = makeCode(layers);
        $('#code').text(code);
    }

    function updateUi() {
        updateDiagramAndCode();
        updateButtonStates();
    }

    function template(text, o) {
        for(key in o){
            text = text.replace(new RegExp('\\{' + key + '\\}', 'g'), o[key])
        }
        return text;
    }

    function buildAddLayerHandler(id, fnUpdateLayer, layerType) {
        return function(){
            var $layerPanel = $(template($('#' + id).html(), {id:nextLayerId}));
            $layerPanel.find('.buttonBox').append(template($('#buttons').html(), {id:nextLayerId}));
            $('#layers').append($layerPanel);

            $layerPanel.find('.layerOk').click(function(){
                $layerPanel.removeClass('stateEditable').addClass('stateNotEditable');
                $layerPanel.find('input').prop('readonly', true);
                updateUi();
            });

            if ($layerPanel.hasClass('noDelete')) {
                $layerPanel.find('.layerDelete').hide();
            } else {
                $layerPanel.find('.layerDelete').click(function(){
                    $layerPanel.remove();
                    updateUi();
                });
            }

            $layerPanel.find('.layerEdit').click(function(){
                $layerPanel.removeClass('stateNotEditable').addClass('stateEditable');
                $layerPanel.find('input').prop('readonly', false);
                $layerPanel.find('input').first().focus();
                updateUi();
            });

            $layerPanel[0].updateNet = fnUpdateLayer;
            $layerPanel[0].layerType = layerType;

            nextLayerId++;

            if ($layerPanel.find('input').length === 0) {
                $layerPanel.find('.layerOk').hide();
                updateDiagramAndCode();
            } else {
                $layerPanel.addClass('stateEditable');
                updateButtonStates();
            }

            $layerPanel.find('input').first().focus();

            $layerPanel.find('input').bind("change paste keyup", function() {
                var emptyFieldCount = $layerPanel.find('input').not('.optional').filter(function(i, el){
                    return ! el.value.match(NUMBER_REGEX);
                }).length;

                $layerPanel.find('.layerOk').prop('disabled', emptyFieldCount > 0);
            });
        }
    }
    function getNumValue($layerPanel, className) {
        return Number($layerPanel.find('.' + className).val());
    }

    $('#addInput').click(buildAddLayerHandler('inputLayer', function($layerPanel, net){
        var h = getNumValue($layerPanel, 'inputHeight'),
            w = getNumValue($layerPanel, 'inputWidth'),
            d = getNumValue($layerPanel, 'inputDepth');
        net.withInputLayer(w, h, d);
    }, 0));

    $('#addConv').click(buildAddLayerHandler('convLayer', function($layerPanel, net){
        var patch   = getNumValue($layerPanel, 'convPatchSize'),
            stride  = getNumValue($layerPanel, 'convStride'),
            outputs = getNumValue($layerPanel, 'convOutputs'),
            pwInput = $layerPanel.find('.convWidthPad').val(),
            phInput = $layerPanel.find('.convHeightPad').val(),
            prevLayer = net.getLastLayer(),
            pw, ph,infoMsg, thisLayer;

        $layerPanel.find('.convWidthPad, .convHeightPad').val('');

        if (pwInput) {
            pw = Number(pwInput);
        } else if (stride === 1) {
            pw = Math.floor(patch/2);
        } else {
            pw = net.utils.calcZeroPadding(prevLayer.w, patch, stride)
        }

        if (phInput) {
            ph = Number(phInput);
        } else if (stride === 1) {
            ph = Math.floor(patch/2);
        } else {
            ph = net.utils.calcZeroPadding(prevLayer.h, patch, stride)
        }

        try {
            if (pw === undefined) {
                infoMsg = 'ERROR: the width of the previous layer prohibits the specified patch/stride combination'
            } else if (ph === undefined) {
                infoMsg = 'ERROR: the height of the previous layer prohibits the specified patch/stride combination'
            } else {
                $layerPanel.find('.convWidthPad').val(pw);
                $layerPanel.find('.convHeightPad').val(ph);
            }

            net.withConvLayer(patch, patch, stride, stride, pw, ph, outputs);

            thisLayer = net.getLastLayer();

            infoMsg = 'Size: [' + [thisLayer.w, thisLayer.h, thisLayer.d].join('x') + ']';

        } catch(e) {
            infoMsg = infoMsg || 'ERROR: Bad padding values (try leaving the Pad boxes empty)';

        } finally {
            $layerPanel.find('.infoBox').text(infoMsg);
        }
    }, 1));

    $('#addRelu').click(buildAddLayerHandler('reluLayer', function($layerPanel, net){
        net.withRelu();
    }, 2));

    $('#addPool').click(buildAddLayerHandler('poolLayer', function($layerPanel, net){
        var s = getNumValue($layerPanel, 'poolSize'),
            t = getNumValue($layerPanel, 'poolStride'),
            prevLayer = net.getLastLayer(),
            pw = net.utils.calcZeroPadding(prevLayer.w, s, t),
            ph = net.utils.calcZeroPadding(prevLayer.h, s, t),
            infoMsg, thisLayer;

        try{
            if (pw !== 0) {
                infoMsg = 'ERROR: the width of the previous layer prohibits the specified pool-size/stride combination'
            } else if (ph !== 0) {
                infoMsg = 'ERROR: the height of the previous layer prohibits the specified pool-size/stride combination'
            }

            net.withPooling(s, s, t, t);

            thisLayer = net.getLastLayer();

            infoMsg = 'Size: [' + [thisLayer.w, thisLayer.h, thisLayer.d].join('x') + ']';

        } finally {
            $layerPanel.find('.infoBox').text(infoMsg);
        }

    }, 3));

    $('#addFc').click(buildAddLayerHandler('fcLayer', function($layerPanel, net){
        var h = getNumValue($layerPanel, 'fcHeight'),
            w = getNumValue($layerPanel, 'fcWidth'),
            d = getNumValue($layerPanel, 'fcDepth');
        net.withFullyConnectedLayer(w, h, d);
    }, 4));

    $('#addOutput').click(buildAddLayerHandler('outputLayer', function($layerPanel, net){
        var o = getNumValue($layerPanel, 'outputCount');
        net.withOutputLayer(o);
    }, 5));
});