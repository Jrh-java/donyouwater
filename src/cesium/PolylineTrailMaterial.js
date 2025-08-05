import * as Cesium from "cesium";
import gsap from "gsap";

class PolylineTrailMaterialProperty {
    constructor(options = {}) {
        this.definitionChanged = new Cesium.Event();
        
        // 从 options 中获取参数
        const { color, speed, repeat } = options;
        
        // 注册材质到 Cesium
        Cesium.Material._materialCache.addMaterial("PolylineTrailMaterial", {
            fabric: {
                type: "PolylineTrailMaterial",
                uniforms: {
                    color: color || new Cesium.Color(0.0, 1.0, 1.0, 0.8), // 默认青色
                    uTime: 0.0,
                    repeat: repeat || new Cesium.Cartesian2(30, 1),
                },
                source: `
                    uniform vec4 color;
                    uniform float uTime;
                    uniform vec2 repeat;
                    
                    czm_material czm_getMaterial(czm_materialInput materialInput) {
                        czm_material material = czm_getDefaultMaterial(materialInput);
                        vec2 st = materialInput.st;
                        
                        // 计算流动效果 - 使用 uTime 替代 czm_frameNumber
                        st.s = fract(st.s - uTime * 2.0);
                        st = st * repeat;
                        
                        // 创建流动条纹效果
                        float stripes = sin(st.s * 20.0) * 0.5 + 0.5;
                        
                        // 添加渐变效果
                        float gradient = smoothstep(0.0, 0.3, stripes) * smoothstep(1.0, 0.7, stripes);
                        
                        material.alpha = gradient * color.a;
                        material.diffuse = color.rgb;
                        material.emission = color.rgb * 0.3; // 添加自发光效果
                        
                        return material;
                    }
                `,
            },
        });

        // 创建参数对象，用来存储材质着色器中需要用的参数
        this.params = {
            color: color || new Cesium.Color(0.0, 1.0, 1.0, 0.8),
            uTime: 0.0,
            repeat: repeat || new Cesium.Cartesian2(30, 1),
            speed: speed || 15,
        };

        // 使用 gsap 创建时间动画
        gsap.to(this.params, {
            uTime: 1.0,
            duration: this.params.speed / 10, // 根据速度调整动画时长
            repeat: -1,
            ease: "none", // 线性动画
        });
    }

    getType() {
        return "PolylineTrailMaterial";
    }

    getValue(time, result) {
        if (!result) {
            result = {};
        }
        result.color = this.params.color;
        result.uTime = this.params.uTime;
        result.repeat = this.params.repeat;
        return result;
    }

    get isConstant() {
        return false;
    }

    equals(other) {
        return this === other;
    }
}

export default PolylineTrailMaterialProperty;

// 定义材质类型
Cesium.Material.PolylineTrailMaterialProperty = "PolylineTrailMaterialProperty";
Cesium.Material.PolylineTrailType = "PolylineTrailType";

// 定义 GLSL 着色器源码
Cesium.Material.PolylineTrailMaterialSource = `
    uniform vec4 color;
    uniform sampler2D image;
    uniform float speed;
    uniform vec2 repeat;
    
    czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        
        // 计算流动效果
        float time = czm_frameNumber * speed / 1000.0;
        st.s = fract(st.s - time);
        st = st * repeat;
        
        // 创建流动条纹效果（即使没有图片也能显示）
        float stripes = sin(st.s * 20.0) * 0.5 + 0.5;
        float alpha = stripes * color.a;
        
        // 如果有图片，则使用图片的透明度
        vec4 colorImage = texture2D(image, st);
        if (colorImage.a > 0.0) {
            alpha = colorImage.a * color.a;
        }
        
        material.alpha = alpha;
        material.diffuse = color.rgb;
        
        return material;
    }
`;

// 注册材质
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailType, {
    fabric: {
        type: Cesium.Material.PolylineTrailType,
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.8),
            image: "/images/arrow.png",
            speed: 1.0,
            repeat: new Cesium.Cartesian2(10, 1),
        },
        source: Cesium.Material.PolylineTrailMaterialSource,
    },
    translucent: function (material) {
        return true;
    },
});

// 初始化材质工具类
export const initPolylineTrailMaterial = () => {
    // 确保材质已注册
    if (!Cesium.Material._materialCache._materials[Cesium.Material.PolylineTrailType]) {
        console.warn('PolylineTrailMaterial 注册失败');
    } else {
        console.log('PolylineTrailMaterial 注册成功');
    }
}; 