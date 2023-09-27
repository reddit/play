import {LitElement, css, html} from 'lit'
import {customElement} from 'lit/decorators.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-logo': PlayLogo
  }
}

@customElement('play-logo')
export class PlayLogo extends LitElement {
  static override styles = css`
    svg {
      display: block;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 40px;
    }
  `

  protected override render() {
    return html` <div
      class="logo-container"
      @click=${() => console.log('Quack!')}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M25.3365 0.799988H9.33649C6.98011 0.799988 5.06982 2.71021 5.06982 5.06665V34.9333C5.06982 37.2898 6.98011 39.2 9.33649 39.2H30.6698C33.0262 39.2 34.9365 37.2898 34.9365 34.9333V10.4L25.3365 0.799988Z"
          fill="#FFD635"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M25.0305 0.0609198C25.3294 -0.0629051 25.6735 0.00553958 25.9023 0.234338L35.5023 9.83434C35.7311 10.0631 35.7996 10.4072 35.6757 10.7062C35.5519 11.0051 35.2602 11.2 34.9366 11.2H29.6033C26.805 11.2 24.5366 8.9316 24.5366 6.13336V0.800023C24.5366 0.476454 24.7315 0.184745 25.0305 0.0609198Z"
          fill="#FFD635"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M25.0305 0.0609198C25.3294 -0.0629051 25.6735 0.00553958 25.9023 0.234338L35.5023 9.83434C35.7311 10.0631 35.7996 10.4072 35.6757 10.7062C35.5519 11.0051 35.2602 11.2 34.9366 11.2H29.6033C26.805 11.2 24.5366 8.9316 24.5366 6.13336V0.800023C24.5366 0.476454 24.7315 0.184745 25.0305 0.0609198Z"
          fill="black"
          fill-opacity="0.5"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M25.9473 0.279288C26.0691 0.421404 26.14 0.604922 26.14 0.800023V2.73479L26.1366 2.73139V6.13336C26.1366 8.04794 27.6887 9.60002 29.6033 9.60002L35 9.6V9.60221C35.0832 9.60845 35.1663 9.62781 35.2461 9.66088C35.3252 9.69363 35.397 9.73811 35.4598 9.79182L35.5023 9.83434C35.5525 9.88457 35.5951 9.94035 35.6295 10C35.6991 10.1206 35.7367 10.2584 35.7367 10.4V34.9333C35.7367 37.7316 33.4682 40 30.67 40H9.33669C6.53849 40 4.27002 37.7316 4.27002 34.9333V5.06667C4.27002 2.26839 6.53849 0 9.33669 0H25.3367C25.5489 0 25.7523 0.0842855 25.9024 0.234315L25.9473 0.279288ZM24.5366 1.6H9.33669C7.42213 1.6 5.87002 3.15206 5.87002 5.06667V34.9333C5.87002 36.8479 7.42213 38.4 9.33669 38.4H30.67C32.5846 38.4 34.1367 36.8479 34.1367 34.9333V11.2H29.6033C26.805 11.2 24.5366 8.9316 24.5366 6.13336V1.6Z"
          fill="black"
        />
        <path
          d="M32.1764 18.0282C32.6073 15.7734 31.3026 13.6294 29.2623 13.2394C27.2219 12.8495 25.2185 14.3612 24.7876 16.616C24.3567 18.8708 25.6614 21.0148 27.7017 21.4047C29.7421 21.7947 31.7455 20.2829 32.1764 18.0282Z"
          fill="#51E9F4"
        />
        <path
          d="M25.8568 20.2641C25.9535 20.2398 26.159 20.3977 26.4894 20.5677C26.8861 20.7785 27.3174 20.9156 27.7627 20.9724C28.2663 21.0347 28.7775 20.9693 29.2495 20.7822C29.6309 20.6332 29.9778 20.4073 30.2689 20.1184C30.6472 19.7117 30.9414 19.2336 31.1343 18.7119C31.3273 18.1901 31.4153 17.6351 31.393 17.0789C31.3854 16.5564 31.2543 16.0432 31.0105 15.5816C30.7667 15.12 30.4172 14.7232 29.9909 14.4239C29.652 14.205 29.2676 14.0671 28.8674 14.0208C28.4671 13.9745 28.0616 14.021 27.6821 14.1567C26.9108 14.4431 26.2693 15.0012 25.8769 15.7271C25.4841 16.4292 25.3008 17.2301 25.3491 18.0341C25.3738 18.4086 25.4456 18.7785 25.5627 19.1349C25.683 19.4678 25.8412 19.7856 26.0341 20.082C25.6235 19.9704 25.2478 19.7559 24.9421 19.4587C24.5735 19.0963 24.2888 18.6569 24.1081 18.1717C23.7725 17.3533 23.7596 16.4373 24.0718 15.6097C24.5144 14.6735 25.2132 13.8832 26.0865 13.3311C26.8771 12.8273 27.8079 12.5918 28.7418 12.6592C29.5959 12.7363 30.4033 13.0851 31.0465 13.6549C31.6381 14.1805 32.0791 14.8554 32.3238 15.6097C32.5545 16.3121 32.6287 17.0568 32.5414 17.7912C32.4545 18.4864 32.2224 19.1553 31.8604 19.7542C31.5177 20.3268 31.0474 20.8117 30.4865 21.1707C29.9567 21.508 29.3514 21.707 28.7257 21.7495C28.4006 21.7739 28.0738 21.7438 27.7586 21.6605C27.4248 21.569 27.1078 21.4241 26.8198 21.2314C26.4352 20.98 26.1072 20.6505 25.8568 20.2641V20.2641Z"
          fill="black"
        />
        <path
          d="M12.6386 15.1491C12.9582 12.9691 12.5223 11.1 11.6649 10.9743C10.8076 10.8486 9.85357 12.514 9.53398 14.694C9.2144 16.874 9.65031 18.7432 10.5076 18.8689C11.3649 18.9945 12.319 17.3292 12.6386 15.1491Z"
          fill="#51E9F4"
        />
        <path
          d="M12.674 14.9542C12.5515 14.863 12.6064 14.1845 12.543 13.4147C12.5171 13.0299 12.4506 12.6484 12.3444 12.2759C12.278 11.9872 12.1438 11.7161 11.9515 11.4824C11.9043 11.4314 11.8469 11.3896 11.7825 11.3594C11.7309 11.3371 11.6745 11.3263 11.6177 11.3276C11.5799 11.3323 11.5435 11.3443 11.5108 11.3627C11.4781 11.3811 11.4498 11.4056 11.4276 11.4348C11.3244 11.533 11.2336 11.6422 11.1572 11.7601C10.9648 12.0658 10.809 12.3905 10.6924 12.7283C10.4434 13.4457 10.2902 14.1894 10.2361 14.9423C10.1736 15.646 10.2091 16.3543 10.3417 17.0493C10.3755 17.1933 10.4193 17.3351 10.4727 17.4738C10.4941 17.5296 10.5195 17.584 10.5488 17.6365C10.5577 17.6595 10.5705 17.6809 10.5868 17.7C10.5868 17.7 10.5868 17.7 10.5868 17.7C10.5868 17.7 10.6333 17.7516 10.6586 17.7555C10.8877 17.6148 11.0834 17.4311 11.2332 17.2159C11.4174 16.9707 11.5826 16.7135 11.7276 16.4462C11.9988 15.9406 12.24 15.4213 12.4501 14.8908C12.7493 15.5118 12.8632 16.1975 12.7796 16.8747C12.7493 17.505 12.4829 18.105 12.0276 18.569C11.8862 18.686 11.735 18.7922 11.5755 18.8864C11.4684 18.9445 11.3568 18.9949 11.2417 19.0372C11.1316 19.0778 11.0167 19.1058 10.8995 19.1205C10.6245 19.1517 10.3459 19.1077 10.097 18.9936C9.84814 18.8796 9.63968 18.7004 9.49671 18.4777C9.44943 18.4111 9.40843 18.3407 9.37418 18.2674C9.30934 18.139 9.25427 18.0064 9.2094 17.8706C9.13786 17.6221 9.08701 17.3687 9.05729 17.1128C8.97013 16.209 9.0042 15.2985 9.1587 14.4027C9.27748 13.5935 9.50022 12.8008 9.82204 12.0418C9.97929 11.6699 10.1927 11.3211 10.4558 11.0062C10.5254 10.9229 10.6032 10.8458 10.6882 10.7761C10.7839 10.692 10.8887 10.6175 11.0009 10.5539C11.2424 10.4312 11.5178 10.38 11.791 10.4071C12.1087 10.4695 12.3912 10.6389 12.5853 10.8832C12.7376 11.0699 12.8587 11.2773 12.9444 11.4982C13.0871 11.8733 13.1669 12.2668 13.181 12.6648C13.2027 13.1212 13.1471 13.5779 13.0162 14.0178C12.9294 14.3382 12.8149 14.6513 12.674 14.9542V14.9542Z"
          fill="black"
        />
        <path
          d="M23.0313 33.5894C25.2517 32.2858 27.3825 30.2265 29.359 28.4556C29.5158 28.3468 29.6474 28.2046 29.7447 28.0387C29.842 27.8729 29.9025 27.6874 29.9222 27.4953C29.8948 27.2888 29.8139 27.0934 29.6878 26.9291C29.5617 26.7649 29.395 26.6377 29.2048 26.5606C28.5663 26.1955 27.8847 25.9983 27.2426 25.6587C26.2095 25.1147 25.5889 24.0923 24.8356 23.1466C23.9266 21.9627 22.7995 20.9705 21.5175 20.2256C18.9312 18.7907 16.0291 18.9659 13.4751 20.4155C12.5209 20.9559 11.6528 21.6934 10.7166 22.2813C8.32392 23.8002 2.44097 23.5483 0.82675 26.2393C0.249217 27.1886 1.33613 28.3096 2.23651 28.7623L7.61725 31.468C10.078 32.7021 12.5639 33.9435 15.1862 34.5277C17.8084 35.1119 20.6351 35.0024 23.0313 33.5894Z"
          fill="#FF4500"
        />
        <path
          d="M23.0615 33.6758C22.5533 34.1034 21.9652 34.4239 21.332 34.6181C20.0346 35.068 18.6623 35.2568 17.2929 35.174C15.7201 35.0699 14.1692 34.7467 12.6844 34.2137C11.2521 33.7191 10.0131 33.1632 9.12151 32.7697C7.55313 32.0874 5.95968 31.3473 4.32327 30.6036L3.09506 30.0332L2.47916 29.7444L2.17122 29.6L2.01366 29.5242L1.83462 29.4339C1.34465 29.1742 0.911209 28.8183 0.559863 28.387C0.357582 28.1438 0.202136 27.8646 0.101522 27.5639C-0.0232513 27.2029 -0.0332641 26.8117 0.0728769 26.4447C0.0945791 26.3488 0.129534 26.2565 0.176719 26.1704C0.210711 26.0904 0.252705 26.0142 0.302047 25.9429C0.377082 25.8168 0.460841 25.6962 0.552702 25.5819C0.72753 25.3612 0.925635 25.1602 1.14353 24.9826C1.55003 24.6461 1.9992 24.3656 2.47916 24.1487C3.36615 23.7558 4.28817 23.4487 5.23278 23.2317L7.88256 22.6144C8.67893 22.4482 9.45132 22.1813 10.1814 21.8202C10.3032 21.7516 10.4607 21.6505 10.6111 21.5494L11.0659 21.2317L12.004 20.5566C12.6739 20.07 13.3943 19.6584 14.1525 19.3292C15.6702 18.6534 17.3459 18.4219 18.9879 18.6613C20.6299 18.9008 22.1719 19.6013 23.4375 20.683C24.0336 21.1699 24.5838 21.7113 25.0811 22.3003C25.5788 22.8743 25.9977 23.4916 26.3916 24.0007C26.7302 24.4785 27.1645 24.8795 27.6664 25.1776C28.1856 25.4628 28.8301 25.6866 29.4783 26.0476C29.6674 26.1482 29.8451 26.2692 30.0082 26.4086L30.1371 26.535C30.1865 26.5879 30.2331 26.6433 30.2768 26.701C30.3592 26.8132 30.4289 26.9343 30.4845 27.0621C30.5875 27.3234 30.6136 27.6092 30.5597 27.8852C30.4994 28.1513 30.3766 28.3989 30.2016 28.6072C30.0746 28.7603 29.9331 28.9006 29.779 29.026L29.421 29.3292L28.7048 29.9249C26.8213 31.5025 25.0023 32.943 23.1653 33.8672C24.5977 32.6361 26.3415 30.7119 28.0567 28.8707L28.7012 28.1956C28.8087 28.0837 28.9232 27.9718 28.9913 27.8888C29.0429 27.8343 29.0842 27.7706 29.113 27.7011C29.1149 27.683 29.1119 27.6647 29.1043 27.6482C29.0968 27.6316 29.0849 27.6175 29.07 27.6072V27.6072C29.07 27.6072 29.0486 27.6072 29.0235 27.5783C28.9615 27.5349 28.8955 27.4974 28.8266 27.4664C28.028 27.0837 27.0791 26.831 26.431 26.3292C25.8771 25.8878 25.394 25.363 24.9987 24.7732C24.6406 24.2462 24.3112 23.766 23.9495 23.3292C23.2551 22.4428 22.4203 21.678 21.4788 21.0656C20.5636 20.4829 19.5313 20.1129 18.4566 19.9826C17.4019 19.8653 16.3346 19.9723 15.3234 20.2967C14.3257 20.6258 13.3865 21.1132 12.5412 21.7407C12.1079 22.0404 11.6746 22.3544 11.2234 22.6469C10.9937 22.7994 10.7545 22.9369 10.5073 23.0584C10.2602 23.1729 10.0067 23.273 9.74815 23.3581C8.76589 23.6653 7.76776 23.9184 6.7582 24.1162C5.80557 24.3061 4.86368 24.5471 3.93654 24.8382C3.07536 25.084 2.28237 25.5276 1.61977 26.1343C1.47847 26.2822 1.35249 26.4443 1.24379 26.618C1.16888 26.7451 1.13743 26.8935 1.15427 27.0404C1.22948 27.3976 1.42108 27.7191 1.69855 27.9538C1.84337 28.0886 2.00042 28.2095 2.16763 28.3148C2.34105 28.4235 2.52172 28.52 2.70833 28.6036L3.90431 29.1812L6.23182 30.304C9.28981 31.7769 12.0685 33.2607 14.8436 34.026C16.4027 34.4773 18.0258 34.6616 19.6454 34.5711C20.8286 34.4842 21.9862 34.1808 23.0615 33.6758V33.6758Z"
          fill="black"
        />
        <path
          d="M5.98462 25.9724C6.03603 25.6068 8.02627 25.2632 8.70193 24.8756C9.90635 24.2029 11.2209 23.585 12.1463 22.7514C12.5465 22.4041 12.9248 21.9946 13.3838 21.5668C13.856 21.1022 14.3942 20.7093 14.9811 20.4005C15.9981 19.8658 17.1864 19.7541 18.2859 20.0898C17.8894 20.5431 17.4487 20.9819 17.1072 21.3438C16.7657 21.7058 16.494 21.969 16.2773 21.9946C15.4144 22.0823 14.647 22.6564 13.9346 23.2304C13.2607 23.7922 12.5437 24.3008 11.7901 24.7513C10.5798 25.5143 9.22053 26.0128 7.80228 26.2137C7.18721 26.2328 6.57317 26.1513 5.98462 25.9724V25.9724Z"
          fill="white"
          fill-opacity="0.5"
        />
        <path
          d="M27.9273 27.7919C27.9273 27.9528 27.214 28.7371 26.1691 29.4678C25.9159 29.6589 25.6377 29.8332 25.3631 30.0041C25.0885 30.1751 24.7996 30.3393 24.525 30.4868C24.2504 30.6343 23.9794 30.7617 23.7369 30.8823C23.4944 31.003 23.2697 31.1002 23.0807 31.1873C22.3968 31.501 21.6795 31.7459 20.9409 31.9181C20.1598 32.0919 19.3612 32.1863 18.5586 32.1996C16.9415 32.2221 15.3364 31.9359 13.8404 31.3583C12.5922 30.8957 11.476 30.3259 10.3918 29.8935C9.34746 29.4703 8.26175 29.1436 7.15003 28.9181C5.2364 28.5461 3.27275 28.4567 1.32983 28.6533C2.13657 28.0573 3.07476 27.6382 4.07588 27.4266C4.94084 27.2029 5.84655 27.1549 6.73278 27.2858C7.75747 27.5213 8.76137 27.8306 9.7356 28.2109C10.6242 28.5648 11.4931 28.9608 12.339 29.3975C13.1083 29.7941 13.9 30.151 14.7106 30.4667C15.0957 30.6175 15.4916 30.7181 15.8768 30.8287C16.2598 30.9205 16.6479 30.9921 17.0394 31.0432C18.4819 31.2283 19.9493 31.1394 21.3546 30.7818C22.5769 30.4677 23.755 30.0176 24.8638 29.441C25.3524 29.1829 26.0514 28.8578 26.647 28.5193L27.0785 28.2813L27.4351 28.0601L27.9273 27.7919Z"
          fill="black"
        />
      </svg>
    </div>`
  }
}
