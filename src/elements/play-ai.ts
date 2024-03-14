import {
  LitElement,
  css,
  html,
  type CSSResultGroup,
  type TemplateResult,
  type PropertyValues,
} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import './play-icon/play-icon.js'
import './play-button.js'
import { og_mixed_context, code_only } from '../utils/ai-prompt.js';

// import type {Diagnostic} from 'typescript'
// import ts from 'typescript'
// import type {Diagnostics} from '../../types/diagnostics.js'
// import type {PreviewError} from '../../types/preview-error.js'
import {Bubble} from '../utils/bubble.js'
import {key} from '../utils/secrets.js'

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Part
} from "@google/generative-ai";

const MODEL_NAME = "gemini-pro";
const API_KEY = key;

const context = og_mixed_context; // Choose prompt here.

declare global {
  interface HTMLElementEventMap {
    'ai-update': CustomEvent<AiUpdate>
  }
  interface HTMLElementTagNameMap {
    'play-ai': PlayAi
  }
}

export enum AiUpdateType {
  start = 'start',
  end = 'end',
  update = 'update'
} 

export type AiUpdate = {
  /** Code to be placed in Editor */
  code: string
  /** Description */
  type: AiUpdateType
}

@customElement('play-ai')
export class PlayAi extends LitElement {
  @property({attribute: false}) text: string = '';
  @property() placeholder: string = 'Enter prompt...';
  @state() private _loading?: boolean;


  static override styles: CSSResultGroup = css`
  .prompt-container {
    padding: 10px;
    width: 100%;
    border-top: solid 1px #576F76;
  }  

  .input-container {
      column-gap: 16px;
      display: flex;
      flex-direction: row;
      overflow: clip;
      height: 40px;
      mid-width: 500px;
      padding: 8px;
      margin-left: 10%;
      margin-right: 10%;
      border-radius: 32px;
      background-color: white;
      border: solid 1px #576F76;
      color: white;
    }

    .input-container input {
      font-size: 14px;
      border: none;
      flex: 1;

    }
    
    .input-container input:focus {
      outline: none;
    }

    .input-submit {
      min-width: 110px;
    }

    .modal {
      visibility: hidden;
      display: none; 
    }

    .modal.loading {
      position: absolute;
      z-index: 100;
      top: 25%;
      left: 25%;
      background-color: white;
      width: 50%;
      height: 25%;
      visibility: visible;
      display: block;
      border-radius: 32px;
      filter: drop-shadow(4px 4px 4px rgba(0,0,0,.5));  
    }

    .modal h2 {
      vertical-align: middle;
      text-align: center;
      display: block;
      visibility: visible;
    }


  `

  async #queryAi() : Promise<void> {
    console.log(`Querying AI with prompt: ${this.text}`);
    const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.01,
    topK: 1,
    topP: 1,
    maxOutputTokens: 4096,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts : Part[] = [context[0] ?? {text :''}, {text: this.text}];
  

  // const result = await model.generateContent({
  //   contents: [{ role: "user", parts }],
  //   generationConfig,
  //   safetySettings,
  // });
  
  const result = await model.generateContentStream({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });
    
    // const response = this.#cleanResponse(result.response.text());

  let text = '';
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    console.log(chunkText);
    text += this.#cleanResponse(chunkText);
    this.dispatchEvent(Bubble<string>('ai-update', text));
  }
  
  // console.log(response);
  this._loading = false;
}

  protected override render(): TemplateResult {
    return html`
      <div class='prompt-container'>
      <div class=${`modal ${this._loading ? 'loading' : 'done'}`}>
          <h2>Loading...</h2>
       </div>
       <div class='input-container'>
          <input
            id="prompt-input"
            type="text"
            placeholder=${this.placeholder}
            .value=${this.text}
            @input=${this.#onInput}
          />
          
          <play-button
            class='input-submit' 
            appearance="bordered"
            size="medium"
            icon="send-outline"
            title="Submit"
            label="Submit"
            @click=${async () => {
              this._loading = true;
              await this.#queryAi();
            }
          }>
          </play-button>
        </div>

      </div>
    `
  }

  // protected override updated(props: PropertyValues<this>): void {
  //   super.updated(props)
  //   const inputElement = this.shadowRoot?.querySelector('#prompt-input')!;
  //   this.text = (inputElement && (inputElement as HTMLInputElement).value) ?? '';
  // }

  #onInput(ev: InputEvent & {currentTarget: HTMLInputElement}): void {
    console.log(`Updating prompt: ${ev.currentTarget.value}`)
    this.text = ev.currentTarget.value;
    // this.dispatchEvent(Bubble<string>('edit-text', ev.currentTarget.value))
  }

  #cleanResponse(txt : string): string {
    return txt.replaceAll(/```.*/gi,'');
  }
  //

}
