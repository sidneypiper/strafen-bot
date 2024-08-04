import {html} from "htm/preact";

export default ({children}) => {
    return html`
        <div>
            <script src="https://cdn.tailwindcss.com"></script>
            ${children}
        </div>
    `
}