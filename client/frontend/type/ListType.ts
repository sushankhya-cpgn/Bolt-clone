export type Node = {
    name: string;
    isFolder: boolean;
    children?: Node[] | null;
}

export type List = {
    list: Node[];
}

export type ExpandedFolder = {
    [key: number] : boolean;
}

