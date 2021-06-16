/*
    ИЕРАРХИЯ ОТОБРАЖЕНИЯ:

    __________РЕНДЕРЕР__________
    ↓                          ↓
 камера                   ___сцена___
                          ↓         ↓
       [источники света...]     ___[меши...]___
                                ↓             ↓
                        геометрия             ______материал______
                                              ↓         ↓        ↓
                                       текстуры       цвета      правила отображения

 в каком порядке необходимо создавать 3D-объект(меш):
    Создаем геометрию
    Создаем материал
    Объединяем геометрию и материал в меш
    Добавляем меш на нашу сцену
*/
import * as THREE from '../lib/three.js'
import {COLORS} from './utils.js'
import Sky from './world/sky.js'
import Sea from './world/sea.js'
import Jet from './jet/jet.js'


class Game {
    constructor() {
        this.world       = document.getElementById('fucking-world')
        this.worldWidth  = this.world.offsetWidth
        this.worldHeight = this.world.offsetHeight
        this.mousePos = {
            x: 0,
            y: 0,
        }
        
        //  1 RENDER
        this.renderer = new THREE.WebGLRenderer({
            // Разрешить прозрачность для сцены, чтобы видеть фон из CSS
            alpha: true,
            
            // Активируем антиалиасинг. Это может повлечь проблемы с производительностью,
            // но наш проект основан на низкополигональных моделях, поэтому должно зайти как по маслу.
            antialias: true
        })
        
        // 2 CAMERA
        this.fieldOfView = 60
        this.aspectRatio = this.worldWidth / this.worldHeight
        this.nearPlane   = 1
        this.farPlane    = 10000
        this.camera      = new THREE.PerspectiveCamera(this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane)
        
        // 3 SCENE
        this.scene = new THREE.Scene()
        
        this._sky  = new Sky(this.scene)
        this._sea  = new Sea(this.scene)
        this._jet  = new Jet(this.scene)
        
        // освещение
        this.hemisphereLight = null
        this.shadowLight     = null
    }
    
    // Сцена, камера и рендеринг
    createScene = () => {
        console.log('--- createScene ---')
        
        // Добавить эффект тумана на нашу сцену
        // его цвет мы возьмем из наших таблиц стилей, а не из переменной
        this.scene.fog = new THREE.Fog(COLORS.fog, 100, 950)
        
        // Зададим позицию камере в пространстве
        this.camera.position.x = 0
        this.camera.position.z = 200
        this.camera.position.y = 100
        
        // Задаем размер рендеру,
        this.renderer.setSize(this.worldWidth, this.worldHeight)
        // Включаем рендер теней
        this.renderer.shadowMap.enabled = true
        
        // рендер в html
        this.world.appendChild(this.renderer.domElement)
    }
    
    // цикл для обновления объектов
    loop = () => {
        // Вращаем пропеллер, море и небо
        this._sea.mesh.rotation.z += .001
        this._sky.mesh.rotation.z += .0005
        this._jet.propeller.rotation.x += 0.3
        
        // рендерим сцену
        this.renderer.render(this.scene, this.camera)
        requestAnimationFrame(this.loop)
    }
    
    createLights = () => {
        console.log('--- createLights ---')
        // Полушарный свет - это градиентный свет
        // первый параметр это цвет неба, второй параметр - цвет земли,
        // третий параметр - интенсивность света
        this.hemisphereLight = new THREE.HemisphereLight(COLORS.sky, COLORS.land, .9)
        
        // Направленный свет светит в определенном направлении из точки,
        // это работает как солнце, что значит что продуцируемые лучи параллельны.
        this.shadowLight = new THREE.DirectionalLight(COLORS.sun, .9)
        
        // направление света
        this.shadowLight.position.set(150, 350, 350)
        
        // отбрасывание теней
        this.shadowLight.castShadow = true
        
        // видимая область теней
        this.shadowLight.shadow.camera.left   = -400
        this.shadowLight.shadow.camera.right  = 400
        this.shadowLight.shadow.camera.top    = 400
        this.shadowLight.shadow.camera.bottom = -400
        this.shadowLight.shadow.camera.near   = 1
        this.shadowLight.shadow.camera.far    = 1000
        
        // разрешение теней
        this.shadowLight.shadow.mapSize.width  = 2048
        this.shadowLight.shadow.mapSize.height = 2048
        
        // Добавить освещение на сцену
        this.scene.add(this.hemisphereLight)
        this.scene.add(this.shadowLight)
    }
    
    // Событие изменения размера экрана,
    // в котором мы запускается функция handleWindowResize(), чтобы обновить камеру и рендер.
    // перерисовывает canvas при изменении размера окна, т.к размер окна может меняться
    handleWindowResize = () => {
        console.log('+++ WindowResize +++')
        
        const worldWidthResize  = this.world.offsetWidth
        const worldHeightResize = this.world.offsetHeight
        
        this.renderer.setSize(worldWidthResize, worldHeightResize)
        this.camera.aspect = worldWidthResize / worldHeightResize
        this.camera.updateProjectionMatrix()
    }
    
    handleMouseMove = (event) => {
        console.log('x: ', this.mousePos.x)
        console.log('y: ', this.mousePos.x)
        console.log(' ')
    
        // конвертируем полученные значение положения мыши
        // в нормализованное значение между -1 и 1
        // вот формула для горизонтальной оси:
        let tx = -1 + (event.clientX / this.worldWidth) * 2
    
        // для вертикальной оси нам необходимо инвертировать нашу формулу,
        // так как в 2D y-ось идет в противоположном направлении, в отличии от y-оси в 3D
    
        let ty   = 1 - (event.clientY / this.worldHeight) * 2
        this.mousePos = {
            x: tx,
            y: ty
        }
    }
    
    
    init = () => {
        this.createScene()  // настройка сцены, камеры и рендера
        this.createLights() // добавление освещения сцены
        
        // добавление мешей на сцену
        this._sea.init()
        this._sky.init()
        this._jet.init()
    
        this.loop()
        
        window.addEventListener('resize', this.handleWindowResize)
        document.addEventListener('mousemove', this.handleMouseMove)
    }
}

const game = new Game()
window.addEventListener('load', game.init)
