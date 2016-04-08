$(function(){
    var nextLayerId = 1,
        NUMBER_REGEX = /^[1-9][0-9]*$/;

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

    function updateUi() {
        updateDiagram();
        updateButtonStates();
    }

    function updateDiagram() {
        var net = buildNetwork();
        $('#layers').find('.layer').each(function() {
            var $layerPanel = $(this);

            $layerPanel[0].updateNet($layerPanel, net);
        });

        diagram.drawLayers(net.getLayers());
        $('#paramCount').text(Number(net.getParameterCount()).toLocaleString());
    }

    function buildAddLayerHandler(id, fnUpdateLayer) {
        return function(){
            var $layerPanel = $(_.template($('#' + id).html())({id:nextLayerId}));
            $layerPanel.find('.buttonBox').append(_.template($('#buttons').html())({id:nextLayerId}));
            $('#layers').append($layerPanel);

            $layerPanel.find('.layerOk').click(function(){
                $layerPanel.removeClass('stateEditable').addClass('stateNotEditable');
                $layerPanel.find('input').prop('readonly', true);
                updateUi();
            });

            $layerPanel.find('.layerDelete').click(function(){
                $layerPanel.remove();
                updateUi();
            });

            $layerPanel.find('.layerEdit').click(function(){
                $layerPanel.removeClass('stateNotEditable').addClass('stateEditable');
                $layerPanel.find('input').prop('readonly', false);
                $layerPanel.find('input').first().focus();
                updateUi();
            });

            $layerPanel[0].updateNet = fnUpdateLayer;

            nextLayerId++;

            if ($layerPanel.find('input').length === 0) {
                $layerPanel.find('.layerOk').hide();
                updateDiagram();
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
    }));

    $('#addConv').click(buildAddLayerHandler('convLayer', function($layerPanel, net){
        var s = getNumValue($layerPanel, 'convPatchSize'),
            t = getNumValue($layerPanel, 'convStride'),
            o = getNumValue($layerPanel, 'convOutputs'),
            pwInput = $layerPanel.find('.convWidthPad').val(),
            phInput = $layerPanel.find('.convHeightPad').val(),
            prevLayer = net.getLastLayer(),
            pw = pwInput ? Number(pwInput) : net.utils.calcZeroPadding(prevLayer.w, s, t),
            ph = phInput ? Number(phInput) : net.utils.calcZeroPadding(prevLayer.h, s, t),
            infoMsg, thisLayer;

        $layerPanel.find('.convWidthPad, .convHeightPad').val('');

        try {
            if (pw === undefined) {
                infoMsg = 'ERROR: the width of the previous layer prohibits the specified patch/stride combination'
            } else if (ph === undefined) {
                infoMsg = 'ERROR: the height of the previous layer prohibits the specified patch/stride combination'
            } else {
                $layerPanel.find('.convWidthPad').val(pw);
                $layerPanel.find('.convHeightPad').val(ph);
            }

            net.withConvLayer(s, s, t, t, pw, ph, o);

            thisLayer = net.getLastLayer();

            infoMsg = 'Size: [' + [thisLayer.w, thisLayer.h, thisLayer.d].join('x') + ']';

        } catch(e) {
            infoMsg = infoMsg || 'ERROR: Bad padding values (try leaving the Pad boxes empty)';

        } finally {
            $layerPanel.find('.infoBox').text(infoMsg);
        }
    }));

    $('#addRelu').click(buildAddLayerHandler('reluLayer', function($layerPanel, net){
        net.withRelu();
    }));

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

    }));

    $('#addFc').click(buildAddLayerHandler('fcLayer', function($layerPanel, net){
        var h = getNumValue($layerPanel, 'fcHeight'),
            w = getNumValue($layerPanel, 'fcWidth'),
            d = getNumValue($layerPanel, 'fcDepth');
        net.withFullyConnectedLayer(w, h, d);
    }));

    $('#addOutput').click(buildAddLayerHandler('outputLayer', function($layerPanel, net){
        var o = getNumValue($layerPanel, 'outputCount');
        net.withOutputLayer(o);
    }));
});