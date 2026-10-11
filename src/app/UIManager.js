

export default class UIManager {

    constructor() {

        this.initialize()

    }

    initialize() {
        this.input = document.getElementById('file-input')
        this.preview = document.getElementById("file-preview");

        this.input.style.opacity =  0;

        this.input.addEventListener("change", this.updateImagePreview.bind(this));
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



}