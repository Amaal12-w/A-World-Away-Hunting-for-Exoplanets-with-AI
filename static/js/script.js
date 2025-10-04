// === THREE.js Background: stars + planets ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const pointLight = new THREE.PointLight(0xffffff,1.2);
pointLight.position.set(200,200,200);
scene.add(pointLight);

// Stars
const starGeo = new THREE.BufferGeometry();
const starCount = 3000;
const positions = new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){positions[i*3]=(Math.random()-0.5)*2000;positions[i*3+1]=(Math.random()-0.5)*2000;positions[i*3+2]=(Math.random()-0.5)*2000;}
starGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xffffff,size:0.9,opacity:0.9,transparent:true}));
scene.add(stars);

// Planets
const loader=new THREE.TextureLoader();
const earth=createPlanet(loader.load('https://threejsfundamentals.org/threejs/resources/images/earth.jpg'),12,-45,10,-160,1);
const mars=createPlanet(loader.load('https://threejsfundamentals.org/threejs/resources/images/mars_1k_color.jpg'),9,80,-10,-220,0.8);
const jupiter=createPlanet(loader.load('https://threejsfundamentals.org/threejs/resources/images/jupiter.jpg'),18,-180,-40,-400,1.8);

function createPlanet(tex,r=12,x=0,y=0,z=-120,s=1){
    const geo=new THREE.SphereGeometry(r*s,64,64);
    const mat=new THREE.MeshStandardMaterial({map:tex});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(x,y,z);
    scene.add(mesh);
    return mesh;
}

camera.position.z=50;
let t=0;

function animate(){
    requestAnimationFrame(animate);
    stars.rotation.y+=0.00035;
    earth.rotation.y+=0.0025; mars.rotation.y+=0.0032; jupiter.rotation.y+=0.0018;
    t+=0.002;
    earth.position.x=-45+Math.cos(t*0.6)*8; earth.position.y=10+Math.sin(t*0.8)*6;
    mars.position.x=80+Math.cos(t*0.4)*12; mars.position.y=-10+Math.sin(t*0.6)*9;
    jupiter.position.x=-180+Math.cos(t*0.2)*20; jupiter.position.y=-40+Math.sin(t*0.25)*16;
    renderer.render(scene,camera);
}
animate();

window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

// === UI interactions ===
document.querySelectorAll('#navbar a').forEach(a=>{
    a.addEventListener('click',e=>{
        e.preventDefault();
        const target=document.querySelector(a.getAttribute('href'));
        if(target) target.scrollIntoView({behavior:'smooth'});
    });
});

document.getElementById('getStartedBtn').addEventListener('click',()=>{
    window.location.href = "/analyze";
});

// Form handling
const contactForm=document.getElementById('contactForm');
const formMsg=document.getElementById('formMsg');
contactForm.addEventListener('submit',e=>{
    e.preventDefault();
    const payload={
        name:document.getElementById('name').value,
        phone:document.getElementById('phone').value,
        email:document.getElementById('email').value,
        message:document.getElementById('message').value,
        time:new Date().toISOString()
    };
    console.log("New submission:",payload);
    formMsg.textContent="✅ Thanks! Your message was received.";
    contactForm.reset();
    setTimeout(()=>formMsg.textContent="",6000);
});