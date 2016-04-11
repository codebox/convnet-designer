#  Convolutional Neural Network Designer

This utility is intended to help anyone who needs to design a Convolutional Neural Network, and may be particularly useful if using [Google's Tensorflow library](https://www.tensorflow.org/).

The utility is [available to use online](https://codebox.net/convnetdesigner/main.html), or can be downloaded from GitHub and used offline by opening the main.html file in a web browser. 

The utility performs the following functions:
* Visualises the network, showing the relative layer sizes and helping to ensure that the overal 'shape' of the network is correct:
![Convnet Designer visualising a network](https://codebox.net/graphics/convnet/convnet_designer2.png)
* Computes the total number of parameters required by the network, allowing the computational complexity of different designs to be compared
* Estimates the amount of memory required by the network
* Validates patch size and stride values for convolutional layers, automatically applying zero-padding if required
![Convnet Designer layer inputs](https://codebox.net/graphics/convnet/convnet_designer1.png)
* Validates pool size and stride values for pooling layers
* Generates the Tensorflow code required to construct the network (example code below)

<pre>
    x0 = tf.placeholder(tf.float32, shape=[None, 49152])
    
    x1 = tf.reshape(x0, [-1,128,128,3])
    x2 = tf.Variable(tf.truncated_normal([3, 3, 3, 32], stddev=0.1))
    x3 = tf.nn.conv2d(x1, x2, strides=[1, 1, 1, 1], padding='SAME')
    
    x4 = tf.nn.max_pool(x3, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    
    x5 = tf.Variable(tf.constant(0.1, shape=[32]))
    x6 = tf.nn.relu(x4 + x5)
    
    x7 = tf.reshape(x6, [-1,64,64,32])
    x8 = tf.Variable(tf.truncated_normal([3, 3, 32, 64], stddev=0.1))
    x9 = tf.nn.conv2d(x7, x8, strides=[1, 1, 1, 1], padding='SAME')
    
    x10 = tf.nn.max_pool(x9, ksize=[1, 2, 2, 1], strides=[1, 2, 2, 1], padding='SAME')
    
    x11 = tf.Variable(tf.constant(0.1, shape=[64]))
    x12 = tf.nn.relu(x10 + x11)
    
    x13 = tf.Variable(tf.truncated_normal([65536, 1024], stddev=0.1))
    x14 = tf.reshape(x12, [-1, 65536])
    x15 = tf.matmul(x14, x13)
    
    x16 = tf.Variable(tf.truncated_normal([1024, 2], stddev=0.1))
    x17 = tf.reshape(x15, [-1, 1024])
    y_conv = tf.matmul(x17, x16)
</pre>
