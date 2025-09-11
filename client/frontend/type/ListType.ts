export type Node = {
    name: string;
    isFolder: boolean;
    children?: Node[] | null;
    content?: string;
}

export type List = Node[];


export type ExpandedFolder = {
    [key: number] : boolean;
}

