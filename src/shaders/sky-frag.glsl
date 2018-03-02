#version 300 es

precision highp float;

uniform mat4 u_ViewProj;

//uniform ivec2 u_Dimensions; // Screen dimensions

ivec2 u_Dimensions = ivec2(300, 300);
const vec3 u_Eye = vec3(0, 15, 20);

uniform float u_Time;

out vec4 out_Col;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

//light to dark
const vec3 sunrise[5] = vec3[](
        vec3(253, 242, 193) / 255.0,
vec3(255, 201, 183) / 255.0,
vec3(255, 138, 157) / 255.0,
vec3(159, 200, 252) / 255.0,
vec3(107, 109, 170) / 255.0);

//dark to light
const vec3 afternoon[5] = vec3[](
        vec3(122, 153, 199) / 255.0,
vec3(167, 182, 213) / 255.0,
vec3(254, 213, 191) / 255.0,
vec3(220, 218, 229) / 255.0,
vec3(237, 231, 238) / 255.0);

//dark to light
// cotton candy sunset palette
const vec3 sunset[5] = vec3[](
        vec3(122, 155, 165) / 255.0,
vec3(220, 153, 162) / 255.0,
vec3(254, 196, 159) / 255.0,
vec3(217, 235, 215) / 255.0,
vec3(162, 230, 249) / 255.0);

// Dusk palette
const vec3 dusk[5] = vec3[](
        vec3(121, 126, 145) / 255.0,
vec3(37, 50, 102) / 255.0,
vec3(135, 105, 136) / 255.0,
vec3(96, 106, 137) / 255.0,
vec3(120, 184, 198) / 255.0);

//light to dark
const vec3 night[5] = vec3[](
        vec3(121, 126, 145) / 255.0,
vec3(96, 106, 137) / 255.0,
vec3(135, 105, 136) / 255.0,
vec3(37, 50, 102) / 255.0,
vec3(4, 4, 46) / 255.0);


const vec3 sunColor = vec3(255, 255, 190) / 255.0;
const vec3 moonColor = vec3(187, 200, 208) / 255.0;

vec2 sphereToUV(vec3);
vec3 uvToSunset(vec2);
vec3 uvToDusk(vec2);
vec3 uvToSunrise(vec2);
vec3 uvToAfternoon(vec2);
vec3 uvToNight(vec2);

float fbm(const in vec3 uv);
float noise(in vec3 p);

float fbm(const in vec2 uv);
float noise(in vec2 uv);
vec2 smoothF(vec2 uv);
// random number generator for stars
float rand(vec2 co);

void main()
{
    vec3 outColor = vec3(0.0);
    // convert fragment coordinates to normalized device coordinates
    vec2 ndc = (gl_FragCoord.xy / vec2(u_Dimensions)) * 2.0 - 1.0; // -1 to 1 NDC

    vec4 p = vec4(ndc.xy, 1, 1); // Pixel at the far clip plane
    p *= 1000.0; // Times known value of camera's far clip plane value so it draws behind everything in world
    p = u_ViewProj * p; // Convert from unhomogenized screen to world space so that we can get the ray from the
    // eye to the point on the far clip plane of the frustrum

    vec3 rayDir = normalize(p.xyz - u_Eye); // get the ray from the camera to point on far clip plane

    vec2 uv = sphereToUV(rayDir); // convert the ray to 2d coordinates for mapping color/texture to the quad

    // return color based on uv y coordinate for shift in coors
    vec3 skyHue = uvToSunset(uv);


    vec2 uvT1 = uv + vec2(u_Time * 0.001);
    vec2 uvT2 = uv + vec2(u_Time * 0.00005, -u_Time * 0.0002);

    // generate noise based on uv and time so the "clouds" move
    float heightField = fbm(rayDir);

    // calculate the 2d slope in order to create a smoother blend between shades
    vec2 slope = vec2(fbm(uvT2 + vec2(1.0/float(u_Dimensions.x), 0.0)) - fbm(uvT2 - vec2(1.0/float(u_Dimensions.x), 0.0)),
                      fbm(uvT2 + vec2(0.0, 1.0/float(u_Dimensions.y))) - fbm(uvT2 - vec2(0.0, 1.0/float(u_Dimensions.y))));

    // define the vector corresponding to where the sun points
    // calculate the angle the sun should be at relative to time (polar coordinates)
    // r = 1 always
    float dayLength = 30000.0;

    float theta = (mod(float(u_Time), dayLength)) * (TWO_PI / dayLength);
    float z = float(cos(theta));
    float y = float(sin(theta));

    float theta2 = mod(theta + PI, TWO_PI);
    float z2 = float(cos(theta2));
    float y2 = float(sin(theta2));

    vec3 sunDir = normalize(vec3(0.0, y, z));
    vec3 moonDir = normalize(vec3(0.0, y2, z2));

    float sunSize = 30.0;
    float moonSize = 30.0;// Sun can exist b/t 0 and 30 degrees from sunDir
    // find the dot product between the ray direction and the sun direction
    // and if it is within 30 degrees of the ray Direction, draw sun


    // return different colors based on the y coordinate of the uv values as well as the slope for a smoother gradient
    vec3 distortedSkyHue;
    vec3 distortedDuskHue = uvToDusk(uv + slope);
    vec3 distortedNextHue;
    vec3 cloudColor;
    int type;
    float val = mod(float(u_Time), dayLength);
    float t;

    // variables denoting end of each time partition
    float sunriseEnd = dayLength / 16.0;
    float sunriseAfternoonEnd = 2.0 * dayLength / 16.0;
    float afternoonEnd = 6.0 * dayLength / 16.0;
    float afternoonSunsetEnd = 7.0 * dayLength / 16.0;
    float sunsetEnd = dayLength / 2.0;
    float sunsetNightEnd = 9.0 * dayLength / 16.0;
    float nightEnd = 15.0 * dayLength / 16.0;

    // variable denoting length of each transition cycle
    float trans_length = dayLength / 16.0;

    // allocate skyHues and cloud colors based on which partition of the path the sun is in
    // sunrise
    if(val <= sunriseEnd) {
        type = 0;
        distortedSkyHue = uvToSunrise(uv + slope);
        cloudColor = sunrise[1];
    } //LERP sunrise afternoon
    else if (val <= sunriseAfternoonEnd) {
        type = 1;
        distortedSkyHue = uvToSunrise(uv + slope);
        distortedNextHue = uvToAfternoon(uv + slope);
        t = (val - sunriseEnd) / trans_length;
        //cloudColor = afternoon[3];
        cloudColor = mix(sunrise[1], afternoon[3], t);
    } //afternoon
    else if (val <=  afternoonEnd) {
        type = 2;
        distortedSkyHue = uvToAfternoon(uv + slope);
        cloudColor = afternoon[3];
//        cloudColor = mix(afternoon[2], afternoon[3], t);
    } // LERP afternoon sunset
    else if (val <=  afternoonSunsetEnd) {
        type = 3;
        distortedSkyHue = uvToAfternoon(uv + slope);
        distortedNextHue = uvToSunset(uv + slope);
        t = (val - afternoonEnd) / trans_length;
        //cloudColor = sunset[3];
        cloudColor = mix(afternoon[3], sunset[3], t);
    } // sunset
    else if (val <= sunsetEnd) {
        type = 4;
        distortedSkyHue = uvToSunset(uv + slope);
        distortedDuskHue = uvToDusk(uv + slope);
        cloudColor = sunset[3];
    } // LERP sunset and night
    else if (val <=  sunsetNightEnd) {
        type = 5;
        distortedSkyHue = uvToSunset(uv + slope);
        distortedDuskHue = uvToDusk(uv + slope);
        distortedNextHue = uvToNight(uv + slope);
        t = (val - sunsetEnd) / trans_length;
        //cloudColor = night[3];
        cloudColor = cloudColor = mix(sunset[3], night[4], t);
    } //night
    else if (val <= nightEnd) {
        type = 6;
        distortedSkyHue = uvToNight(uv + slope);
        cloudColor = night[4];
    } // LERP night to sunrise
    else {
        type = 7;
        distortedSkyHue = uvToNight(uv + slope);
        distortedNextHue = uvToSunrise(uv + slope);
        t = (val - nightEnd) / trans_length;
        cloudColor = sunrise[0];
        cloudColor = cloudColor = mix(night[4], sunrise[1], t);
    }



    // daytime
    if(val <= (dayLength / 2.0)) {
        // if not within 30 degress of the ray Direction,
        // draw the sky, blending from sunset to dusk
        float raySunDot = dot(rayDir, sunDir);
        // partition into day categories(sunrise, afternoon, sunset)
        //sunrise
        if(type == 0) {
            outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
        } //LERP
        else if (type == 1) {
            vec3 skyMix = mix(distortedSkyHue, distortedNextHue, t);
            outColor = mix(skyMix, cloudColor, heightField * 0.75);
        } //afternoon
        else if (type == 2) {
            outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
        } //LERP
        else if (type == 3) {
            vec3 skyMix = mix(distortedSkyHue, distortedNextHue, t);
            outColor = mix(skyMix, cloudColor, heightField * 0.75);
        } //sunset
        else if (type == 4) {
            outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
        }

        float angle = acos(dot(rayDir, sunDir)) * 360.0 / PI;
        float angle2 = acos(dot(rayDir, moonDir) * 360.0 / PI);

        //draw sun on top
        if(angle < 7.5)
        {
            outColor = mix(sunColor, cloudColor, heightField * 0.75 * angle / 30.0);
        }
    }
    else { // nighttime, draw sun as the moon
        float angle = acos(dot(rayDir, sunDir)) * 360.0 / PI;
        float angle2 = acos(dot(rayDir, moonDir)) * 360.0 / PI;

        // if not within 30 degress of the ray Direction,
        //        float raySunDot = dot(rayDir, sunDir);

        // decides whether or not to draw a star
        float r = rand(uv);
        //
        if(type == 5) {
            outColor = vec3(1, 0, 0);
            vec3 skyMix = mix(distortedSkyHue, distortedNextHue, t);
            outColor = mix(skyMix, cloudColor, heightField * 0.75);
            if(r < 1.0/10000000000000.0) {
                outColor = mix(outColor, vec3(1, 1, 1), t);
            }
        } else if (type == 6) {
            outColor = mix(distortedSkyHue, cloudColor, heightField * 0.75);
            if(r < 1.0/10000000000000.0) {
                outColor = vec3(1, 1, 1);
            }
        } else if (type == 7) {
            vec3 skyMix = mix(distortedSkyHue, distortedNextHue, t);
            outColor = mix(skyMix, cloudColor, heightField * 0.75);
            if(r < 1.0/10000000000000.0) {
                outColor = mix(vec3(1, 1, 1), outColor, t);
            }
        }

        // draw sun
        if(angle < 7.5)
        {
            outColor = mix(sunColor, cloudColor, heightField * 0.75 * angle / 30.0);
        }

    }



    out_Col = vec4(outColor, 1);
}


highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

vec3 uvToNight(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return night[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(night[0], night[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(night[1], night[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(night[2], night[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(night[3], night[4], (uv.y - 0.65) / 0.1);
    }
    return night[4]; // 0.75 to 1
}

vec3 uvToAfternoon(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return afternoon[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(afternoon[0], afternoon[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(afternoon[1], afternoon[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(afternoon[2], afternoon[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(afternoon[3], afternoon[4], (uv.y - 0.65) / 0.1);
    }
    return afternoon[4]; // 0.75 to 1
}

vec3 uvToSunrise(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return sunrise[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(sunrise[0], sunrise[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(sunrise[1], sunrise[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(sunrise[2], sunrise[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(sunrise[3], sunrise[4], (uv.y - 0.65) / 0.1);
    }
    return sunrise[4]; // 0.75 to 1
}

// return different colors based on the y coordinate of the uv values to create a sky gradient
vec3 uvToSunset(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return sunset[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(sunset[0], sunset[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(sunset[1], sunset[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(sunset[2], sunset[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(sunset[3], sunset[4], (uv.y - 0.65) / 0.1);
    }
    return sunset[4]; // 0.75 to 1
}

vec3 uvToDusk(vec2 uv)
{
    // Below horizon
    if(uv.y < 0.5)
    {
        return dusk[0];
    }
    else if(uv.y < 0.55) // 0.5 to 0.55
    {
        return mix(dusk[0], dusk[1], (uv.y - 0.5) / 0.05);
    }
    else if(uv.y < 0.6)// 0.55 to 0.6
    {
        return mix(dusk[1], dusk[2], (uv.y - 0.55) / 0.05);
    }
    else if(uv.y < 0.65) // 0.6 to 0.65
    {
        return mix(dusk[2], dusk[3], (uv.y - 0.6) / 0.05);
    }
    else if(uv.y < 0.75) // 0.65 to 0.75
    {
        return mix(dusk[3], dusk[4], (uv.y - 0.65) / 0.1);
    }
    return dusk[4]; // 0.75 to 1
}

// Convert a point on a sphere to a UV coordinate in order to map color and texture to a point on the quad
vec2 sphereToUV(vec3 p)
{
    float phi = atan(p.z, p.x); // Returns atan(z/x)
    if(phi < 0.0)
    {
        phi += TWO_PI; // [0, TWO_PI] range now
    }
    // ^^ Could also just add PI to phi, but this shifts where the UV loop from X = 1 to Z = -1.
    float theta = acos(p.y); // [0, PI]
    return vec2(1.0 - phi / TWO_PI, 1.0 - theta / PI);
}


vec2 smoothF(vec2 uv)
{
    return uv*uv*(3.-2.*uv);
}
// for use in fbm
float noise(in vec2 uv)
{
    const float k = 257.0;
    vec4 l  = vec4(floor(uv),fract(uv));
    float u = l.x + l.y * k;
    vec4 v  = vec4(u, u+1.,u+k, u+k+1.);
    v       = fract(fract(1.23456789*v)*v/.987654321);
    l.zw    = smoothF(l.zw);
    l.x     = mix(v.x, v.y, l.z);
    l.y     = mix(v.z, v.w, l.z);
    return    mix(l.x, l.y, l.w);
}

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(in vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = vec4(a.x, a.x, a.y, a.y) + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + vec4(a.z, a.z, a.z, a.z);
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float fbm(const in vec3 uv)
{
    float a = 0.5;
    float f = 5.0;
    float n = 0.;
    int it = 8;
    for(int i = 0; i < 32; i++)
    {
        if(i<it)
        {
            n += noise(uv*f)*a;
            a *= .5;
            f *= 2.;
        }
    }
    return n;
}

float fbm(const in vec2 uv)
{
    float a = 0.5;
    float f = 5.0;
    float n = 0.;
    int it = 8;
    for(int i = 0; i < 32; i++)
    {
        if(i<it)
        {
            n += noise(uv*f)*a;
            a *= .5;
            f *= 2.;
        }
    }
    return n;
}
