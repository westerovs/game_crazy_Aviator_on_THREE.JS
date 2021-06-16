import * as THREE from '../../lib/three.js'
import {COLORS} from '../utils.js'

export default class Jet {
    constructor(scene) {
        this.mesh  = new THREE.Object3D()
        this.scene = scene
    }
    
    createCabin = () => {
        const geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1)
        const matCockpit  = new THREE.MeshPhongMaterial({ color: COLORS.red, shading: THREE.FlatShading })
        const cockpit     = new THREE.Mesh(geomCockpit, matCockpit)
        
        cockpit.castShadow    = true
        cockpit.receiveShadow = true
        this.mesh.add(cockpit)
    }
    
    createEngine = () => {
        const geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1)
        const matEngine  = new THREE.MeshPhongMaterial({ color: COLORS.white, shading: THREE.FlatShading })
        const engine     = new THREE.Mesh(geomEngine, matEngine)
        
        engine.position.x    = 40
        engine.castShadow    = true
        engine.receiveShadow = true
        
        this.mesh.add(engine)
    }
    
    createTail = () => {
        const geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1)
        const matTailPlane  = new THREE.MeshPhongMaterial({ color: COLORS.red, shading: THREE.FlatShading })
        const tailPlane     = new THREE.Mesh(geomTailPlane, matTailPlane)
        
        tailPlane.position.set(-35, 25, 0)
        tailPlane.castShadow    = true
        tailPlane.receiveShadow = true
        
        this.mesh.add(tailPlane)
    }
    
    
    createWing = () => {
        const geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1)
        const matSideWing  = new THREE.MeshPhongMaterial({ color: COLORS.red, shading: THREE.FlatShading })
        const sideWing     = new THREE.Mesh(geomSideWing, matSideWing)
        
        sideWing.castShadow    = true
        sideWing.receiveShadow = true
        
        this.mesh.add(sideWing)
    }
    
    createPropeller = () => {
        const geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1)
        const matPropeller  = new THREE.MeshPhongMaterial({ color: COLORS.brown, shading: THREE.FlatShading })
        
        this.propeller               = new THREE.Mesh(geomPropeller, matPropeller)
        this.propeller.castShadow    = true
        this.propeller.receiveShadow = true
    }
    
    createBlade = () => {
        // лопасть
        const geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1)
        const matBlade  = new THREE.MeshPhongMaterial({ color: COLORS.brownDark, shading: THREE.FlatShading })
        const blade     = new THREE.Mesh(geomBlade, matBlade)
        
        blade.position.set(8, 0, 0)
        blade.castShadow    = true
        blade.receiveShadow = true
        
        this.propeller.add(blade)
        this.propeller.position.set(50, 0, 0)
        this.mesh.add(this.propeller)
    }
    
    createJet = () => {
        this.createCabin()
        this.createEngine()
        this.createTail()
        this.createWing()
        this.createPropeller()
        this.createBlade()
    }
    
    normalize = (v, vmin, vmax, tmin, tmax) => {
        let nv = Math.max(Math.min(v, vmax), vmin);
        let dv = vmax - vmin;
        let pc = (nv - vmin) / dv;
        let dt = tmax - tmin;
        let tv = tmin + (pc * dt);
        
        return tv;
    }
    
    updatePlane = (mousePos) => {
        // давайте двигать наш самолет в промежутке -100 и 100 по горизонтали
        // и между 25 и 175 по вертикали,
        // в зависимости от позиции курсора мыши, у которого разброс значений между -1 и 1 в обоих направлениях;
        // чтобы добиться этого, мы используем функцию нормализации (ее вы можете увидеть чуть ниже этой)
    
        console.log('x: ', mousePos.x)
        console.log('y: ', mousePos.x)
        console.log(' ')
        
        const targetX = this.normalize(mousePos.x, -1, 1, -100, 100);
        const targetY = this.normalize(mousePos.y, -1, 1, 25, 175);

        // обновляем позицию нашего самолета
        this.mesh.position.y = targetY;
        this.mesh.position.x = targetX;
        this.propeller.rotation.x += 0.3;
    }
    
    init = () => {
        console.log('--- create JET ---')
        
        this.createJet()
    
        this.mesh.scale.set(0.25, 0.25, 0.25)
        this.mesh.position.y = 100
        this.scene.add(this.mesh)
    }
    
}



