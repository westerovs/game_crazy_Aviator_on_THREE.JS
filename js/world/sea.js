import * as THREE from '../../lib/three.js';
import { COLORS } from '../utils.js'

export default class Sea {
    constructor(scene) {
        this.scene = scene
        this.geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
        
        // повернем наш объект по оси x
        this.geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        
        this.mat = new THREE.MeshPhongMaterial({
            color      : COLORS.blue,
            transparent: true,
            opacity    : 0.6,
            shading    : THREE.FlatShading,
        });
        
        this.mesh = new THREE.Mesh(this.geom, this.mat);
        this.mesh.receiveShadow = true;
    }
    
    init = () => {
        // Подвинем объект в нижнюю часть сцены
        this.mesh.position.y = -600;
        // Добавим море меш на сцену
        this.scene.add(this.mesh);
    }
    
}
