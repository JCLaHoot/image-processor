import ImageProcessor from "./ImageProcessor";
import UIManager from "./UIManager";


export default class App {

    constructor() {
        
        this.initialize()


    }

    initialize() {

        this.input = document.getElementById('file-input')
        this.button = document.getElementById("file-button");


        this.uiManager = new UIManager()
        this.imageProcessor = new ImageProcessor()
        

        this.button.addEventListener("click", () => {
            this.imageProcessor.processImages(this.input.files)
        } );


    }
}