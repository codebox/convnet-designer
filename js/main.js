$(function(){
    var nextLayerId = 1;
    function updateLayers() {
        var net = buildNetwork();
        $('#layers').find('.layer').each(function() {
            var $layerPanel = $(this);

            $layerPanel[0].updateNet($layerPanel, net);
        })

        diagram.drawLayers(net.getLayers());
    }

    function buildAddLayerHandler(id, fnUpdateLayer){
        return function(){
            var $layerPanel = $(_.template($('#' + id).html())({id:nextLayerId}));
            $layerPanel.append(_.template($('#buttons').html())({id:nextLayerId}));
            $('#layers').append($layerPanel);

            $layerPanel.addClass('stateEditable');

            $layerPanel.find('.layerOk').click(function(){
                $layerPanel.removeClass('stateEditable').addClass('stateNotEditable');
                $layerPanel.find('input').prop('readonly', true);
                updateLayers();
            });

            $layerPanel.find('.layerDelete').click(function(){
                $layerPanel.remove();
                updateLayers();
            });

            $layerPanel.find('.layerEdit').click(function(){
                $layerPanel.removeClass('stateNotEditable').addClass('stateEditable');
                $layerPanel.find('input').prop('readonly', false);
                $layerPanel.find('input').first().focus();
            });

            $layerPanel[0].updateNet = fnUpdateLayer;

            nextLayerId++;

            if ($layerPanel.hasClass('noInputs')) {
                updateLayers();
            }
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
        var s = getNumValue($layerPanel, 'convPathSize'),
            t = getNumValue($layerPanel, 'convStride'),
            o = getNumValue($layerPanel, 'convOutputs');
        net.withConvLayer(s, s, t, t, 0, 0, o);
    }));
    $('#addRelu').click(buildAddLayerHandler('reluLayer', function($layerPanel, net){
        net.withRelu();
    }));
    $('#addPool').click(buildAddLayerHandler('poolLayer', function($layerPanel, net){
        var s = getNumValue($layerPanel, 'poolSize'),
            t = getNumValue($layerPanel, 'poolStride');
        net.withPooling(s, s, t, t);
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