import { type Node } from "../type/ListType";

//Convert flat object coming from backend to tree structure for file explorer.
export default function convertToTree(data: any[]):Node[]{
    const root: Node[] = [];
    console.log("Data received for tree conversion:", data);

    data.forEach(item => {
        
        // For root folder coming from backend
        if(item.type === "Create folder"){
            root.push({
                name: item.title,
                isFolder: true,
                children : []
            })
        }
        // root = [{name: "Project", isFolder: true, children: []}]

        // File coming from backend

        else if(item.type === "Create File"){
            const parts = item.title.split('/'); // ["src","components","Header","Navbar.js"]
            let currentLevel = root; 

            parts.forEach((part,index) => {
                const isLast = index === parts.length - 1;

                let existingNode = currentLevel.find(node => node.name === part);

                if(!existingNode){
                    existingNode = {
                        name: part,
                        isFolder: !isLast,
                        children: isLast ? undefined : [],
                        content: isLast ? item.code : undefined,
                    };
                    currentLevel.push(existingNode);
                }
                if (existingNode.isFolder && existingNode.children) {
                     currentLevel = existingNode.children;
        }
            })
        }

        
    })

    return root;
}