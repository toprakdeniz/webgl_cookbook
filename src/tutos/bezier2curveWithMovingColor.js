const fragmentShader = `
uniform float time;
uniform vec2 resolution;

#define PI 3.14159265359
#define T (time/2.)

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.,2./3.,1./3.,3.);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);
}
float ease_x(float n) { // normalized Hermite h10
  return n*(1.-n)*(1.-n)*27./4.;
}
float nd(float n) { // normal dist (σ=0.01,μ=0.0)
	return exp(-n*n/0.0002)/sqrt(PI*0.0002);
}
float ease_y(float n) { // easeOutExpo modified by nd
  float expo = -pow(2., -10. * n) + 1.;
  return expo - 0.04*nd(n);
}
void main( void ) {
  vec2 p = ( gl_FragCoord.xy / resolution.xy );
  vec2 f = vec2(fract(T), 0.5);
  float v = 1. - 2.*ease_x(fract(p.x-f.x)) - ease_y(abs(f.y-p.y));
  float flare = 1. - pow(length(p-f)*(p.x < f.x ? 15. : 30.),.5) + 0.002*nd(fract(f.x-p.x)) + 0.01*nd(abs(f.y-p.y));
  gl_FragColor = vec4( mix(hsv2rgb(vec3(p.x-.35, 1., v)),vec3(1.),max(0.,min(1.,flare))), 1.0 );
}
`;

const vertexShader = `
	void main()	{
		gl_Position = vec4( position, 1.0 );
	}`;