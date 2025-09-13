export enum StepType {
    CreateFile = "Create File",
    CreateFolder = "Create Folder",
    EditFile = "Edit File",
    DeleteFile = "Delete File",
    RunScript   = "Run Script"
}

export type  Step = {
    id: number;
    title: string;
    description: string;
    type: StepType;
    status: 'pending' | 'in-progress' | 'completed';
    code?: string;
}

