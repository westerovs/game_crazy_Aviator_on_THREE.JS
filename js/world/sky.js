import * as THREE from '../../lib/three.js';
import { COLORS } from '../utils.js'

const clouds = function() {
    // Создаем пустой контейнер, который будет содержать составные части облаков (кубы)
    this.mesh = new THREE.Object3D();
    
    // Создаем геометрию куба, этот куб будет дублироваться для создания облаков
    const geom = new THREE.BoxGeometry(20, 20, 20);
    
    // создадим простой материал для кубов
    const mat = new THREE.MeshPhongMaterial({
        color: COLORS.white,
    });
    
    // продублируем куб рандомное количество раз
    const nBlocs = 3 + Math.floor(Math.random() * 3);
    // применим цикл для каждого куба и поместим их в наш меш
    
    for (let i = 0; i < nBlocs; i++) {
        // создадим меш путем клонирования куба циклом
        const m = new THREE.Mesh(geom, mat);
        
        // зададим случайную позицию и ротацию каждому кубу
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;
        
        // зададим случайным образом размер нашим кубам
        const s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);
        
        // позволим каждому кубу отбрасывать и преломлять тени
        m.castShadow    = true;
        m.receiveShadow = true;
        
        // добавим куб в наш контейнер облаков, который создали в начале этой функции
        this.mesh.add(m);
    }
}

export default class Sky {
    constructor(scene) {
        // создадим пустой контейнер
        this.mesh = new THREE.Object3D();
        this.scene = scene
        
        // количество облаков
        this.CLOUDS_COUNT = 120;
        
        // Чтобы распределить облака равномерно,
        // нам необходимо разместить их с одинаковым промежутком друг от друга,
        // для этого мы рассчитаем величину угла для каждого следующего облака
        this.stepAngle = Math.PI * 2 / this.CLOUDS_COUNT;
    }
    
    createClouds = (count) => {
        // создадим облака для неба в цикле
        for (let i = 0; i < count; i++) {
            const cloud = new clouds();
        
            // зададим угол поворота и позицию для каждого облака
            // для этого мы используем немного тригонометрии
            const angle = this.stepAngle * i; // это конечный угол поворота облака
            const horizon = 750 + Math.random() * 200; // это расстояние между центром оси и облаком
        
            // Тригонометрия!!!
            // конвертируем полярные координаты (угол, расстояние) в Декартовые координаты (x, y)
            cloud.mesh.position.y = Math.sin(angle) * horizon;
            cloud.mesh.position.x = Math.cos(angle) * horizon;
        
            // поворачиваем облако относительно его позиции
            cloud.mesh.rotation.z = angle + Math.PI / 2;
        
            // облака на случайной глубине на нашей сцене
            cloud.mesh.position.z = -400 - Math.random() * 400;
        
            // также установим случайный размер для каждого облака
            const size = 1 + Math.random() * 2;
            cloud.mesh.scale.set(size, size, size);
        
            // не забудьте добавить каждое облако в наш контейнер
            this.mesh.add(cloud.mesh);
        }
    }
    
    init = () => {
        console.log('create Sky')
        this.createClouds(this.CLOUDS_COUNT)
        this.mesh.position.y = -750;
        this.scene.add(this.mesh);
    }
}
