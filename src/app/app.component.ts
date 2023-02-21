import { Component, ElementRef, ViewChild } from '@angular/core';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

interface Note {
    id: number;
    created: string;
    content: string;
};

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    private speechRecognition: any;
    public isRunning: boolean = false;
    @ViewChild('textBox') textBox!: ElementRef<HTMLParagraphElement>;
    public isDownloading: boolean = false;
    private localStore: Storage = window.localStorage;
    public storedNotes: Array<Note> = [];

    constructor() {
        if ('webkitSpeechRecognition' in window) {
            console.log("webkit speech in window!")
            this.speechRecognition = new webkitSpeechRecognition();
            this.initSpeech();
        } else if('SpeechRecognition' in window) {
            console.log("firefox speech in window!")
            this.speechRecognition = new SpeechRecognition();
            this.initSpeech();
        } else {
            console.log("speech NOT in window...")
        }
        // events 
        this.speechRecognition.onresult = (e:any) => {
            console.log("results?", e, e.results[e.results.length - 1][0].transcript)
            this.textBox.nativeElement.innerHTML += e.results[e.results.length - 1][0].transcript;
        };
        this.speechRecognition.onerror = (e:any) => {
            console.log("error?", e)
        };
        this.speechRecognition.onnomatch = (e:any) => {
            console.log("no match?", e)
        };
        this.speechRecognition.onend = (e:any) => {
            console.log("ended?", e)
            if(this.isRunning) {
                this.startRecognition();
            }
        };
        // console.log("stored notes: ", this.localStore)
        this.getLocalNotes();
    }

    initSpeech() {
        this.speechRecognition.lang = 'en-US';
        this.speechRecognition.continuous = true;
        console.log("speech init:",this.speechRecognition)
        this.startRecognition();
    }

    startRecognition() {
        this.speechRecognition.start();
        this.isRunning = true;
    }

    stopRecognition() {
        this.speechRecognition.stop();
        this.isRunning = false;
    }

    downloadNote() {
        this.isDownloading = true
        const text:string = this.textBox.nativeElement.innerHTML;
        const fileName:string = "note.txt";
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => {this.isDownloading = false});
    }

    clearText() {
        this.textBox.nativeElement.innerHTML = "";
    }

    storeLocal() {
        const id: number = (this.localStore.length + 1);
        const newNote: Note = {
            id,
            created: new Date().toISOString(),
            content: this.textBox.nativeElement.innerHTML
        };
        this.localStore.setItem(`note__${id}`, JSON.stringify(newNote));
        // console.log("storing local", this.localStore)
        this.storedNotes.push(newNote);
        this.clearText();
    }

    getLocalNotes() {
        console.log("storage:", this.localStore)
        if(this.localStore.length > 0) {
            const notesArray: Array<string> = Object.values(this.localStore);
            console.log("notes arr", notesArray)
            for(let note of notesArray) {
                console.log("parsed note: ", JSON.parse(note))
                this.storedNotes.push(JSON.parse(note));
            }
        }
    }
}
