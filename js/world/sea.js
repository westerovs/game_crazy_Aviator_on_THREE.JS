import * as THREE from '../../lib/three.js';
import { COLORS } from '../utils.js'

export default class Sea {
    constructor(scene) {
        this.scene = scene
        // Создадим геометрию цилиндра
        // верхний радиус, нижний радиус, высота, количество сегментов по окружности, количество сегментов по вертикали
        const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
        
        // повернем наш объект по оси x
        geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
        
        // создадим материал для нашего объекта
        const mat = new THREE.MeshPhongMaterial({
            color      : COLORS.blue,
            transparent: true,
            opacity    : 0.6,
            shading    : THREE.FlatShading,
        });
        
        // Для создания объекта в Three.js, нам необходимо создать меш,
        // который является совокупностью созданной ранее геометрии и материала
        this.mesh = new THREE.Mesh(geom, mat);
        
        // Разрешим морю отбрасывать тени
        this.mesh.receiveShadow = true;
    }
    // / Теперь мы инициализируем наше море и добавим его на сцену:
    createSea = () => {
        // Подвинем объект в нижнюю часть нашей сцены
        this.mesh.position.y = -600;
        
        // Добавим море меш на сцену
        this.scene.add(this.mesh);
    }
    
}
