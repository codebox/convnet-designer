#  Convolutional Neural Network Designer

This utility is intended to help anyone who needs to design a Convolutional Neural Network, 
and may be particularly useful if using [Google's Tensorflow library](https://www.tensorflow.org/).

The utility performs the following functions:
* Visualises the network showing the relative layer sizes, which can help to ensure that the 'shape' of the network is correct
* Computes the total number of parameters required by the network, allowing the computational complexity of different designs to be compared
* Estimates the amount of memory required by the network
* Validates patch size and stride values for convolutional layers, automatically applying zero-padding if required
* Validates pool size and stride values for pooling layers
* Generates the Tensorflow code required to construct the network 

### TODO List
* Update url to contain network params, auto build network based on url params
* Fix fuzzy lines on canvas
