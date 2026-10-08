import { buildPaletteSync, applyPaletteSync, utils } from 'image-q';
import { optimise } from '@jsquash/oxipng';

export default class UIManager {

    constructor() {



        this.intialize()

    }

    intialize() {
        this.input = document.getElementById('file-input')
        this.preview = document.getElementById("file-preview");
        this.button = document.getElementById("file-button");

        this.input.style.opacity =  0;

        this.input.addEventListener("change", this.updateImagePreview.bind(this));
        // this.updateImagePreview()

        this.button.addEventListener("click", this.resizeImages.bind(this));

        this.canvas = document.createElement('canvas')
        document.getElementById("main").appendChild(this.canvas)

    }


    updateImagePreview() {

        while (this.preview.firstChild) {
            this.preview.removeChild(this.preview.firstChild);
        }

        const currentFiles = this.input.files

        if(currentFiles.length === 0) {
            const para = document.createElement("p");
            para.textContent = "No files currently selected for upload";
            this.preview.appendChild(para);
        }
        else {
            const list = document.createElement("ol");
            this.preview.appendChild(list);

            for(const file of currentFiles) {
                
                const listItem = document.createElement("li");
                const para = document.createElement("p");

                if (this.validFileType(file)) {
                    para.textContent = `File name ${file.name}, file size ${this.returnFileSize(
                    file.size,
                    )}.`;
                    const image = document.createElement("img");
                    image.src = URL.createObjectURL(file);
                    image.alt = image.title = file.name;

                    listItem.appendChild(image);
                    listItem.appendChild(para);
                } else {
                    para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
                    listItem.appendChild(para);
                }

                list.appendChild(listItem);


            }

        }


    }

    fileTypes = [
    "image/apng",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
    "image/x-icon",
    ];

    validFileType(file) {
        return this.fileTypes.includes(file.type);
    }

    returnFileSize(number) {
    if (number < 1e3) {
        return `${number} bytes`;
    } else if (number >= 1e3 && number < 1e6) {
        return `${(number / 1e3).toFixed(1)} KB`;
    }
    return `${(number / 1e6).toFixed(1)} MB`;
    }


    resizeImages() {

        const currentFiles = this.input.files

        const canvasContext = this.canvas.getContext("2d");


        const img = new Image(); // Create new img element

        img.addEventListener("load", () => {
            const w = Math.max(1, Math.round(img.width / 10))
            const h = Math.max(1, Math.round(img.height / 10))

            this.canvas.width = w
            this.canvas.height = h

            canvasContext.drawImage(img, 0, 0, w, h);

            this.quantizeImages()

            // this.downloadImage()


        });



        if(currentFiles.length === 0) {
            return
        }
        else {

            for (const file of currentFiles) {
                img.src = URL.createObjectURL(file)
                

                // canvasContext.drawImage(img, 0, 0);
                
            }
        }

        // img.sr


    }


    quantizeImages() {

        // this.canvas


        // read the image
        const inPointContainer = utils.PointContainer.fromHTMLCanvasElement(this.canvas)

        // convert palette
        const palette = buildPaletteSync([inPointContainer], {
              colorDistanceFormula: 'pngquant', // optional

            colors: 4,
        });

        const outPointContainer = applyPaletteSync(inPointContainer, palette, {
            // imageQuantization: 'burkes', // optional
        });

        const result = new ImageData(
        new Uint8ClampedArray(outPointContainer.toUint8Array()),
        outPointContainer.getWidth(),
        outPointContainer.getHeight()
        );

        let compressedResult = this.compressImage(result)
        // console.log(compressedResult)
        // this.downloadImage(compressedResult)
        
        this.canvas.getContext("2d").putImageData(result, 0, 0);

    }

    compressImage(imageData) {

        // let compressedImageBuffer = optimise(imageData)
        optimise(imageData, {
            level: 4,
        })
        .then((compressedArrayBuffer) =>{
            let imageBlob = new Blob([compressedArrayBuffer], {type:'image/png'})

            this.downloadImage(imageBlob)

            return imageBlob
        })
  

    }



    downloadImage(imageBlob) {

        let aDownload = document.createElement('a')
        aDownload.type = 'download'
        aDownload.href = URL.createObjectURL(imageBlob)
        aDownload.download = 'file-name'
        aDownload.click();
        aDownload.remove()
        // let canvasURL = this.canvas.toDataURL()

        // const createEl = document.createElement('a');
        // createEl.href = canvasURL;

        //  createEl.download = "download-this-canvas";

        // Click the download button, causing a download, and then remove it
        // createEl.click();
        // createEl.remove();
    }

}