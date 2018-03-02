cityKathryn Miller

Link: https://kathrynmiller.github.io/homework-5-shape-grammar-city-KathrynMiller/index.html

![](city.png)

General Approach: 

I started by creating a Grammar class that had method for sub dividing an initial base cube along the x and z axis as well as being able to scale it in the y direction. Each piece of geometry was represented as a shape that maintained its geometry type, position, orientation and color. I then made a CityRenderer class that maintained a set of all of the geometry in the city. My CityRenderer class has methods for placing the buildings and roads in the city as well as dividing the base meshes before combining all the geometry into a final vbo set and rendering. 

Grammar: 

My approach to subdividing the roads was to start everything with a 1x .5 x 1 block and subdivide it along x and z into one of five different configurations. Each configuration chooses a random direction at which to do its subdivisions. After dividing, a building can be scaled in the y direction. The amount by which it is scaled is determined by its proximity to the center of the city (where a population would typically be denser) and then jittered a little bit so that not every building equidistant from the center is the same height. I also maintained a boolean for each shape to tell the city renderer if the parent geometry had a roof yet. If it didn't have a roof I would append one of three random roofs to the top of the currenty shape at the same position, orientation, and scale in the x and z direction. Only ever dividing the buildings ensured that there would be no overlap but I think the base cube approach led to chunks of buildings that look too perfectly spaced.

Building Placement:

I knew initally that I wanted to do a city with a concentric layout so I created a method for placing a building at a given radius and angle relative to the center of the city (which is the origin as default). I then made methods for creating rings of buildings or roads given a change in theta and radius. What I didn't get to finish was making roads that extend radially outward from each of the rings to the next. My idea was to draw the buildings in a ring as I draw the radial roads by picking a few random thetas at which to draw the roads. Then, if the angle at which I was about to place a current building was close enough to one of the randomly selected angles at which I would draw a road, I wouldn't place a building but would instead draw a line from the inner road's radius to the next concentric radius. I got it to work such that the buildings would leave room for roads but somehow my roads were drawing incorrectly so I'd like to fix that in the future (it looks too uniform as is).

Color:

I assigned each geometry a color as a linear interpolation of two colors based on the building's distance from the center of the city. Then I added a skybox I wrote earlier this year.

