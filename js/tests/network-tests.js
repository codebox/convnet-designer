describe("network", function() {
    var net, inputLayer;

    function checkNetwork(expectedLayers) {
        var actualLayers = net.getLayers();

        expect(actualLayers.length).toBe(expectedLayers.length);

        actualLayers.forEach(function(actualLayer, i) {
            var expectedLayer = expectedLayers[i];

            expect(actualLayer.h).toEqual(expectedLayer.h);
            expect(actualLayer.w).toEqual(expectedLayer.w);
            expect(actualLayer.d).toEqual(expectedLayer.d);
            expect(actualLayer.i).toEqual(expectedLayer.i);
            expect(actualLayer.o).toEqual(expectedLayer.o);
        });
    }

    function buildLayer(w, h, d) {
        return {
            w : w,
            h : h,
            d : d
        };
    }

    it("input layer only", function() {
        net = buildNetwork(buildLayer(16, 16, 3));

        checkNetwork([{h:16, w:16, d:3, i:768, o:768}]);
    });

    it("simple convolution stride 1", function() {
        net = buildNetwork(buildLayer(16, 16, 3));

        net.addConvolutionSimple(3, 1, 0, 2);

        checkNetwork([
            {h:16, w:16, d:3, i:768, o:768},
            {h:14, w:14, d:2, i:768, o:392}
        ]);
    });

    it("simple convolution stride 2", function() {
        net = buildNetwork(buildLayer(17, 17, 1));

        net.addConvolutionSimple(5, 2, 0, 4);

        checkNetwork([
            {h:17, w:17, d:1, i:289, o:289},
            {h: 7, w: 7, d:4, i:289, o:196}
        ]);
    });

    it("simple convolution stride 3 with padding", function() {
        net = buildNetwork(buildLayer(14, 14, 1));

        net.addConvolutionSimple(7, 3, 1, 2);

        checkNetwork([
            {h:14, w:14, d:1, i:196, o:196},
            {h: 4, w: 4, d:2, i:196, o:32}
        ]);
    });

    it("simple convolution with bad stride value", function() {
        net = buildNetwork(buildLayer(14, 14, 1));

        expect(function() {
            net.addConvolutionSimple(3,2,0,2);
        }).toThrow(new Error("Bad strideWidth value: 2 is not a factor of 11"));
    });

});