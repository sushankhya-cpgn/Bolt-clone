export enum StepType {
    'CreateFile',
    'CreateFolder',
    'EditFile',
    'DeleteFile',
    'RunScript'
}

export type  Step = {
    id: number;
    title: string;
    description: string;
    type: StepType;
    status: 'pending' | 'in-progress' | 'completed';
    code?: string;
}

