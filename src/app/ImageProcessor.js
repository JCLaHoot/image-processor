import { buildPaletteSync, applyPaletteSync, utils } from 'image-q';
import { optimise } from '@jsquash/oxipng';

const sizeReduction = 10
const maxColours = 5
const compressionLevel = 4 // must be 0-6, diminishing returns after 4.

export default class ImageProcessor {

    constructor() {

        this.canvas = new OffscreenCanvas(0,0)

        this.files = null

        this.output = document.getElementById("output");

        
    }

    // Takes a series of images, resizes them, reduces their colour palette, compresses them, and downloads them.
    processImages(files) {

        this.output.innerHTML= ''


        if(files.length === 0) {
            return
        }

        this.files = files

        this.resizeImages(files)
        .then(this.quantizeImages.bind(this))
        .then(this.compressImages)
        .then(this.downloadImages.bind(this))
    }


    // takes image files, resizes them, and outputs an array of imageData
    resizeImages(files) {

        const canvasContext = this.canvas.getContext("2d");
        const results = []


        return new Promise((resolve,reject) =>{
            let resizedCount = 0

            const img = new Image(); // Create new img element


            img.addEventListener("load", () => {


                // Draw the image
                const w = Math.max(1, Math.round(img.width / sizeReduction))
                const h = Math.max(1, Math.round(img.height / sizeReduction))

                this.canvas.width = w
                this.canvas.height = h

                canvasContext.drawImage(img, 0, 0, w, h);

                // Export the ImageData
                const imageData = canvasContext.getImageData(0,0,w, h)
                results.push(imageData)

                // Handle async loading
                resizedCount++
                
                if(resizedCount === files.length) {
                    img.remove()
                    console.log('done resizing')

                    resolve(results)
                }
                else {
                    img.src = URL.createObjectURL(files[resizedCount])
                }

            });

            img.src = URL.createObjectURL(files[resizedCount])

        })


    }


    // Takes an array of image data and quantizes it (reduces the colour palette)
    quantizeImages(imageDataArray) {

        const results = []

        return new Promise((resolve, reject) => {

            imageDataArray.forEach((imageData) => {

                // read the image and convert it to a point container
                const inPointContainer = utils.PointContainer.fromImageData(imageData)

                // create a new palette from the point container
                const palette = buildPaletteSync([inPointContainer], {
                    colorDistanceFormula: 'pngquant', // optional
                    colors: maxColours,
                });

                // apply the the new palette to the point container
                const outPointContainer = applyPaletteSync(inPointContainer, palette, {
                    // imageQuantization: 'burkes', // optional
                });

                // create a new ImageData from the point container
                const result = new ImageData(
                    new Uint8ClampedArray(outPointContainer.toUint8Array()),
                    outPointContainer.getWidth(),
                    outPointContainer.getHeight()
                );

                results.push(result)

                // Preview the image
                this.previewImage.bind(this)(result)

                
            });

            console.log('done quantizing')
            resolve(results)

        })

    }

    async previewImage(imageData) {
        const canvasContext = this.canvas.getContext("2d");

        this.canvas.width = imageData.width
        this.canvas.height = imageData.height

        canvasContext.putImageData(imageData, 0, 0)
        const blob = await this.canvas.convertToBlob({ type: 'image/png' });

        let img = document.createElement('img')

        img.src = URL.createObjectURL(blob)
        this.output.appendChild(img)

    }


    // takes an array of images and compresses them, turning them into Blobs
    compressImages(imageDataArray) {

        const results = [];

        return new Promise((resolve, reject) =>{

            imageDataArray.forEach((imageData) => {
                optimise(imageData, {
                    level: compressionLevel,
                })
                .then((compressedArrayBuffer) =>{
                    let imageBlob = new Blob([compressedArrayBuffer], {type:'image/png'})

                    results.push(imageBlob)


                    if(imageDataArray.length === results.length ) {
                        console.log('done compressing')
                        resolve(results)
                    }
                })

            })


        })
  

    }


    // takes an array of image blobs and downloads them as PNGs
    downloadImages(imageBlobs) {

        let downloadNext = (i) => {
            if (i >= imageBlobs.length) {
                return;
            }

            let aDownload = document.createElement('a')
            aDownload.target = '_parent';

            aDownload.type = 'download'
            aDownload.href = URL.createObjectURL(imageBlobs[i])
            aDownload.download = `${this.files[i].name}`
            aDownload.click();
            aDownload.remove()

            setTimeout(() => {
                    downloadNext(i + 1);
            }, 500);

        }

        downloadNext(0)
    }



}