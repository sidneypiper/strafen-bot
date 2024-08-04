import {html} from "htm/preact";
import Layout from "./Layout";

interface TableData {
    headers: string[]
    rows: { [key: string]: any }[]
}

export default (props: TableData) => {
    console.log(props)
    return html`
        <${Layout}>
            <div id="table" class="relative overflow-x-auto p-12 bg-gray-800">
                <table style="font-size: 3rem; line-height: 1.2"
                       class="w-full text-left rtl:text-right text-gray-400">
                    <thead class="uppercase text-gray-400">
                    <tr>
                        ${props.headers.map(header => html`
                            <th scope="col" class="px-12 py-6 bg-gray-700 first:rounded-l-3xl last:rounded-r-3xl">
                                ${header}
                            </th>
                        `)}
                    </tr>
                    </thead>
                    <tbody>
                    ${props.rows.map(row => html`
                        <tr class="border-b-4 border-gray-700 last-child:border-b-none">
                            ${Object.keys(row).map(key => html`
                                <td class="px-12 py-6 text-white first:font-medium">${row[key]}</td>
                            `)}
                        </tr>
                    `)}
                    </tbody>
                </table>
            </div>
        <//>
    `
}