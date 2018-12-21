import LiteEvent from "./event";

// Handles implemenation of narration, including playing the audio and
// highlighting the currently playing text.
// Enhance: Copy more code from old BloomPlayer to handle pause and auto-play.
// Enhance: Pause will be a prop for this control, but somehow we need to
// notify the container if we are paused forcibly by Chrome refusing to
// let us play until the user interacts with the page.
export default class Narration {

    private static playerPage: HTMLElement;
    private static idOfCurrentSentence: string;
    private static playingAll: boolean;
    private static paused: boolean = false;
    public static urlPrefix: string;

    public static PageNarrationComplete: LiteEvent<HTMLElement>;

    public static playAllSentences(page: HTMLElement): void {
        this.playerPage = page;
        const audioElts = this.getPageAudioElements();
        const original: Element | null = page.querySelector(".ui-audioCurrent");
        for (let firstIndex = 0; firstIndex < audioElts.length; firstIndex++) {
            const first = audioElts[firstIndex];
            if (!this.canPlayAudio(first)) {
                continue;
            }
            this.setCurrentSpan(original, first);
            this.playingAll = true;
            //this.setStatus("listen", Status.Active);
            this.playCurrentInternal();
            return;
        }
        // Nothing to play
        if (this.PageNarrationComplete) {
            this.PageNarrationComplete.raise();
        }
    }

    private static playCurrentInternal() {
        if (!this.paused) {
            (<any> this.getPlayer().play()).catch((reason: any) => {
                console.log("could not play sound: " + reason);
                this.removeAudioCurrent();
                // if (this.Pause) {
                //     this.Pause.raise();
                // }
            });
        }
    }

    private static removeAudioCurrent() {
        Array.from(document.getElementsByClassName("ui-audioCurrent"))
            .forEach(elt => elt.classList.remove("ui-audioCurrent"));
    }

    private static setCurrentSpan(current: Element | null, changeTo: HTMLElement | null): void {
        this.removeAudioCurrent();
        if (changeTo) {
            changeTo.classList.add("ui-audioCurrent");
            this.idOfCurrentSentence = changeTo.getAttribute("id")||"";
        }
        this.updatePlayerStatus();
        //this.changeStateAndSetExpected("record");
    }

    private static updatePlayerStatus() {
        const player  = this.getPlayer();
        player.setAttribute("src", this.currentAudioUrl( this.idOfCurrentSentence)
            + "?nocache=" + new Date().getTime());
    }

    private static currentAudioUrl(id: string): string {
        return this.urlPrefix +"/audio/" + id + ".mp3";
    }

    private static getPlayer(): HTMLMediaElement {
        return this.getAudio("player", (audio) => {
              // if we just pass the function, it has the wrong "this"
             audio.addEventListener("ended", () => this.playEnded());
             audio.addEventListener("error", () => this.playEnded());
        });
    }

    public static playEnded(): void {
        if (this.playingAll) {
            const current: Element|null = this.playerPage.querySelector(".ui-audioCurrent");
            const audioElts = this.getPageAudioElements();
            let nextIndex = audioElts.indexOf(<HTMLElement> current) + 1;
            while (nextIndex < audioElts.length) {
                const next = audioElts[nextIndex];
                if (!this.canPlayAudio(next)) {
                    nextIndex++;
                    continue;
                }
                this.setCurrentSpan(current, next);
                //this.setStatus("listen", Status.Active); // gets returned to enabled by setCurrentSpan
                this.playCurrentInternal();
                return;
            }
            this.playingAll = false;
            this.setCurrentSpan(current, null);
            if (this.PageNarrationComplete) {
                this.PageNarrationComplete.raise(this.playerPage);
            }
            //this.changeStateAndSetExpected("listen");
            return;
        }
        //this.changeStateAndSetExpected("next");
    }

    private static getAudio(id: string, init: (audio: HTMLAudioElement) => void ) {
        let player  = document.querySelector("#" + id) as HTMLAudioElement;
        if (!player) {
            player = document.createElement("audio") as HTMLAudioElement;
            player.setAttribute("id", id);
            document.body.appendChild(player);
            init(player);
        }
        return <HTMLMediaElement> player;
   }

    public static canPlayAudio(current: Element): boolean {
        return true; // currently no way to check
    }

    // Returns all elements that match CSS selector {expr} as an array.
    // Querying can optionally be restricted to {container}’s descendants
    // If includeSelf is true, it includes both itself as well as its descendants.
    // Otherwise, it only includes descendants.
    private static findAll(expr: string, container: HTMLElement, includeSelf: boolean = false): HTMLElement[] {
        // querySelectorAll checks all the descendants
        let allMatches: HTMLElement[] = [].slice.call((container || document).querySelectorAll(expr));

        // Now check itself
        if (includeSelf && container && container.matches(expr)) {
            allMatches.push(container);
        }

        return allMatches;
    }

    private static getRecordableDivs(container: HTMLElement) {
        return this.findAll("div.bloom-editable.bloom-content1", container);
    }

    // Optional param is for use when 'playerPage' has NOT been initialized.
    // Not using the optional param assumes 'playerPage' has been initialized
    private static getPageRecordableDivs(page?: HTMLElement): HTMLElement[] {
        return this.getRecordableDivs(page ? page : this.playerPage);
    }

    // Optional param is for use when 'playerPage' has NOT been initialized.
    // Not using the optional param assumes 'playerPage' has been initialized
    private static getPageAudioElements(page?: HTMLElement): HTMLElement[] {
        return [].concat.apply([], this.getPageRecordableDivs(page).map(x => this.findAll(".audio-sentence", x, true)));
    }
}