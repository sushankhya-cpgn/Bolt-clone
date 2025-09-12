//  "<boltArtifact id=\"project-import\" title=\"Project Files\"><boltAction type=\"file\" filePath=\"eslint.config.js\">import js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport tseslint from 'typescript-eslint';\n\nexport default tseslint.config(\n  { ignores: ['dist'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n    files: ['**/*.{ts,tsx}'],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n    },\n    plugins: {\n      'react-hooks': reactHooks,\n      'react-refresh': reactRefresh,\n    },\n    rules: {\n      ...reactHooks.configs.recommended.rules,\n      'react-refresh/only-export-components': [\n        'warn',\n        { allowConstantExport: true },\n      ],\n    },\n  }\n);\n</boltAction></boltArtifact>"

/* 
Output:
[{
    title: "Project Files",
    status: "Pending",
},{
    id: number,
    title: "eslint.config.js",
    type: "file",
    // code: import js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport tseslint from 'typescript-eslint';\n\nexport default tseslint.config(\n  { ignores: ['dist'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n   
    },
    {
        title: "Run command",
        code: "node index.js",
        type: StepType.RunScript
    }
]
*/

import {type Step,  StepType } from "../type/StepType";

export default function parseStepXML(response: string):Step[]{

    const xmlMatch = response.match((/<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/))
    if(!xmlMatch){
        return [];
    }

    const xmlContent = xmlMatch[1];
    const steps: Step[] = [];
    let stepId = 1;

    // Extract the artifact title
    const titleMatch = response.match(/<boltArtifact[^>]*title="([^"]*)"/);
    const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

    steps.push({
        id: stepId++,
        title: artifactTitle,
        description: "",
        type: StepType.CreateFolder,
        status: "pending"
    })
        // Process each boltAction
        const actionRegex = /<boltAction[^>]*type="([^"]*)"[^>]*filePath="([^"]*)"[^>]*>([\s\S]*?)<\/boltAction>/g;
        let match;

        while ((match = actionRegex.exec(xmlContent)) !== null) {
            const [, type, filePath, code] = match;

            if(type === "file"){
                steps.push({
                    id: stepId++,
                    title: filePath || "New File",
                    description: "",
                    type: StepType.CreateFile,
                    status: "pending",
                    code: code.trim()
                })
            }

           else if(type === "script"){
                steps.push({
                    id: stepId++,
                    title: filePath || "Run Script",
                    description: "",
                    type: StepType.RunScript,
                    status: "pending",
                    code: code.trim()
                })

            
            }
       }

       return steps;
}