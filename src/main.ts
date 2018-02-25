import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Plane from './geometry/Plane';
import Roof1 from './geometry/Roof1';
import CityRenderer from './CityRenderer';

var OBJ = require('webgl-obj-loader');
let roof1: object;
let leaf: object;
window.onload = function() {
  OBJ.downloadMeshes({
    'roof1': './src/objs/roof1.obj',
   // 'leaf': './src/objs/leaf.obj'
  }, function(meshes: any) {
    roof1 = meshes.roof1;
    Roof1.setObjData(roof1);
   // leaf = meshes.leaf;
    main2();
  });
}


// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {

};

let city: CityRenderer;
let square: Square;
let base: Plane;
let time: number = 0;


function loadScene() {
  // modified cube to be plant base
  base = new Plane(vec3.fromValues(0, 0, 0), vec3.fromValues(4, 4, 4), 0.0, [.8, 1, .8, 1]);
  base.create();
  city = new CityRenderer("c", 1);
  city.create();
}

// fix for loader being called after main
function main() {}

function main2() {

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  

  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

    loadScene();

  const camera = new Camera(vec3.fromValues(0, 2, 8), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

 
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  // initialize time in shader
  lambert.setTime(time);
  time++;
  
  // This function will be called every frame
  function tick() {
    camera.update();
    
    lambert.setTime(time);
    time++;

    

    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
  
    renderer.render(camera, lambert, [
       base, 
       city
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}


main();
