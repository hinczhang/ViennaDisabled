<template>
<div>
    <el-card>
        <div class="title" style="font-size:20px!important;text-align: center!important">Hot spots suitable for the disabled in Vienna</div>
    </el-card>
    <el-card><div id="map" class="map">
        <el-card class="card">
            <div class="title">Information</div>
            <div id="name">&nbsp;</div>
            <div id="content">&nbsp;</div>
            </el-card>
    </div>
    </el-card>
</div>
</template>

<script>
//导入基本模块
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
//导入相关模块
import ImageWMS from 'ol/source/ImageWMS'
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Projection from 'ol/proj/Projection';
import {fromLonLat} from 'ol/proj';
import {Stroke, Style, Fill,Circle, Text} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer'
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer';
import {bbox} from 'ol/loadingstrategy';
import {Vector} from 'ol/source';
import OlExtLegend from 'ol-ext/legend/Legend'
import OlExtLegendControl from 'ol-ext/control/Legend'
export default {
    data () {
        return { 
            
        }
    },
    mounted() {
        this.initMap();
    },
    methods: {
        initMap () {
            var this_ = this;
            var source = new ImageWMS({
                url: 'http://tomcat.standardserve.org/geoserver/vienna/wms',
                params: {LAYERS: 'vienna:vienna_dis',VERSION: '1.1.0' },
                ratio: 1,
                serverType: 'geoserver',
                projection: 'EPSG:4326'
            });
            var layer = new ImageLayer({
                source: source,
            });
            var POISource = new Vector({
                format: new GeoJSON(),
                url: 'http://tomcat.standardserve.org/geoserver/vienna/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vienna%3APOI&maxFeatures=50&outputFormat=application%2Fjson',
                strategy: bbox
            });
            var POIRoadSource = new Vector({
                format: new GeoJSON(),
                url: 'http://tomcat.standardserve.org/geoserver/vienna/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vienna%3APOI_roads&maxFeatures=50&outputFormat=application%2Fjson',
                strategy: bbox
            });
            var POIBuildingSource = new Vector({
                format: new GeoJSON(),
                url: 'http://tomcat.standardserve.org/geoserver/vienna/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vienna%3APOI_Building&maxFeatures=50&outputFormat=application%2Fjson',
                strategy: bbox
            });

            var POIStyle = new Style({
                image: new Circle({
                    stroke: new Stroke({
                        color: '#3399CC',
                        width: 1.25
                    }),
                    radius: 8,
                    fill: new Fill({
                        color: '#FFCCFF'
                    }),
                }),
            });

            var RoadStyle = new Style({
                stroke: new Stroke({
                    color: 'green',
                    width: 5,
                }),
            })

            var BuildingStyle = new Style({
                stroke: new Stroke({
                    color: '#663333',
                    width: 2,
                }),
                fill: new Fill({
                    color: '#FFFFCC'
                }),
            })


            
            const POIvector = new VectorLayer({
                source: POISource,
                style: function(feature){
                    return POIStyle;
                }
            });

            const POIRoadvector = new VectorLayer({
                source: POIRoadSource,
                style: function(feature){
                    return RoadStyle;
                }
                
            });

            const POIBuildingvector = new VectorLayer({
                source: POIBuildingSource,
                style: function(feature){
                    return BuildingStyle;

                }
                
            });

            


            this.map = new Map({
                target: "map",
                layers: [layer,POIBuildingvector,POIRoadvector,POIvector],
                view: new View({
                    center: [16.36937,48.20882],
                    zoom: 16,
                    projection: 'EPSG:4326'
                }),
            });

            const PointSelectStyle = function(feature){ 
               return new Style({
                    text: new Text({
                        text: feature.get("name"),
                        font: "Arial",
                        textAlign: "center",
                        fill: new Fill({color:"#aa3300"}),
                        stroke: new Stroke({color:"#ffffff",width:3}),
                        offsetX: 0,
                        offsetY: 15
                    }),
                    image: new Circle({
                        stroke: new Stroke({
                            color: '#3399FC',
                            width: 1.25
                        }),
                        radius: 8,
                        fill: new Fill({
                            color: '#ab3f52'
                        }),
                    }),
                });
            }

            const LineSelectStyle = function(feature){ 
                return new Style({
                    text: new Text({
                        text: String(feature.get("len")).split(".")[0]+"m",
                        font: "Arial",
                        textAlign: "center",
                        fill: new Fill({color:"#aa3300"}),
                        stroke: new Stroke({color:"#ffffff",width:3}),
                        offsetX: 0,
                        offsetY: 15
                    }),
                    
                    stroke: new Stroke({
                        color: 'red',
                        width: 2
                    }),
                       
                });
            }

            const BuildingSelectStyle = function(feature){ 
                return new Style({
                    text: new Text({
                        text: feature.get("name"),
                        font: "Arial",
                        textAlign: "center",
                        fill: new Fill({color:"#aa3300"}),
                        stroke: new Stroke({color:"#ffffff",width:3}),
                        offsetX: 0,
                        offsetY: 15
                    }),
                    
                    stroke: new Stroke({
                        color: 'ff6633',
                        width: 2
                    }),
                    fill: new Fill({
                        color:"red"
                    }),
                       
                });
            }
            const name = document.getElementById('name');
            const content = document.getElementById('content');

            let selected = null;
            this.map.on('pointermove', (e)=>{
                if (selected !== null) {
                    selected.setStyle(undefined);
                    selected = null;
                }

                this.map.forEachFeatureAtPixel(e.pixel, function (f) {
                    selected = f;
                    if(f.getGeometry().constructor.name === "Point"){
                        f.setStyle(PointSelectStyle(f));
                    }else if(f.getGeometry().constructor.name === "LineString"){
                        f.setStyle(LineSelectStyle(f))
                    }else{
                        f.setStyle(BuildingSelectStyle(f))
                    }
                    
                    return true;
                });

                if (selected) {
                    //console.log(selected.getGeometry().constructor.name)
                    
                    if(selected.getGeometry().constructor.name == "Point"){
                        name.innerHTML = '<br><div style="font-weight: bold;text-align: left">Name: </div><div style="float:left">'+selected.get("name")+'</div>';
                        content.innerHTML = '<br><div style="font-weight: bold;text-align: left">Transportation: </div><div style="float:left">'+selected.get("public_transport")+'</div>'
                    }
                    if(selected.getGeometry().constructor.name == "MultiPolygon"){
                        name.innerHTML = '<br><div style="font-weight: bold;text-align: left">Name: </div><div style="float:left">'+selected.get("name")+'</div>';
                        content.innerHTML = '<br><div style="font-weight: bold;text-align: left">Amenity: </div><div style="float:left">'+selected.get("amenity")+'</div>'
                    }
                    if(selected.getGeometry().constructor.name == "LineString"){
                        name.innerHTML = '<br><div style="font-weight: bold;text-align: left">Length: </div><div style="float:left">'+selected.get("len")+'m</div>';
                        var nearPOIs = Array.from(new Set(String(selected.get("near")).split(","))).join(', ')
                        content.innerHTML = '<br><div style="font-weight: bold;text-align: left">Nearby POIs: </div><div style="float:left">'+nearPOIs+'</div>'
                    }
                    

                } else {
                    name.innerHTML = '&nbsp;';
                    content.innerHTML = '&nbsp;'
                }
            })

            const initLegend = () => {
                this_.mLegend = new OlExtLegend({
                    title: 'Legend',
                    margin: 5
                });
                this_.mLegend.addItem({
                    title: "Location suitable for Travel", // 图例的名称
                    typeGeom: 'Point', // 图例的要素类型
                    style:  POIStyle// 返回Style类的样式对象
                });
                this_.mLegend.addItem({
                    title: "Road suitable for Travel",
                    typeGeom: 'LineString',
                    style: RoadStyle 
                });
                this_.mLegend.addItem({
                    title: "Building suitable for Travel",
                    typeGeom: 'Polygon',
                    style: BuildingStyle
                })
                const legendCtrl = new OlExtLegendControl({
                    legend: this_.mLegend,
                    collapsed: false
                });
                this_.map.addControl(legendCtrl);
            }
            initLegend()
        }
    }
}
</script>

<style scoped>
.map {
    width: 100%;
    height: 800px;
    position: relative;
}
/* 新弹框*/ 
#featureTiPing {
  position: absolute;
  top: 10px;
  left: 50px;
  width: 287px;
  background-color: #000000;
  border-radius: 6px;
  opacity: 0.76;
  z-index: 999999;
  display: none;
  border-radius: 4px;
  color: #000;
  padding: 10px 10px 10px 20px;
}
#featureTiPing .d4 {
  margin: 0 auto;
  width: 0;
  height: 0;
  border-width: 20px;
  border-style: solid;
  z-index: 9999;
  border-color: transparent #000 transparent transparent;
  transform: rotate(-90deg);
  position: absolute;
  left: 41%;
}
.card{
    position: absolute;
	width: 20%;
	height: 20%;
	top: 0%;
	left: 80%;
	margin-left: 0;
	margin-top: 0 px;
	z-index: 1;
}
.title{
    font-family: "lucida sans unicode", "lucida grande", sans-serif;
    font-size: 15px;
    font-weight: bold;
    text-align: left;

}
</style>
