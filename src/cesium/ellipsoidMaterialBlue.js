import * as Cesium from "cesium";
import gsap from "gsap";
class CustomMaterialProperty {
  constructor() {
    this.definitionChanged = new Cesium.Event(); //
    Cesium.Material._materialCache.addMaterial("CustomMaterial333", {
      fabric: {
        type: "CustomMaterial",
        uniforms: {
          uTime: 0,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput)
          {
            czm_material material = czm_getDefaultMaterial(materialInput);
            material.diffuse = vec3(0.2, 0.5, 1.0);
            material.specular = 0.5;
            material.shininess = 1.5;
            material.alpha = uTime/3.5;
            return material;
          }
          
          `,
      },
    });
    //创建一个对象  用来存储材质着色器中需要用的参数
    this.params = {
      uTime: 0.1,
    };
    gsap.to(this.params, {
      uTime: 1.2,
      duration: 1,
      repeat: -1,
      yoyo: true,
    });
  }

  getType() {
    return "CustomMaterial333";
  }
  getValue(time, result) {
    result.uTime = this.params.uTime;
    return result;
  }
}
export default CustomMaterialProperty;