const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl', {antialising: false});

const wind = window.wind = new WindGL(gl);

const draw = () => {
    wind.draw();
    requestAnimationFrame(draw);
}
