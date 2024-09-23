"use client";

import { useState, useRef } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Select, SelectSection, SelectItem } from '@nextui-org/select';
import { Eye, EyeOff } from 'lucide-react';
import { processSubmission } from '@/services/processSubmission';

export default function Main() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [secretKey, setSecretKey] = useState<string>('');
    const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
    const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
    const [selectedRegion, setSelectedRegion] = useState<string>('IN');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSecretKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSecretKey(event.target.value);
    };

    const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRegion(event.target.value);
    };

    const handleSubmit = async () => {
        setProcessingSubmission(true);
        await processSubmission(selectedFile, secretKey, selectedRegion);
        setProcessingSubmission(false);
        setSecretKey('');
        setSelectedFile(null);
        setSelectedRegion('IN');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mt-8 flex flex-col gap-4">
            <Input
                type="file"
                label="Upload Phone numbers in CSV"
                isRequired
                style={{ fontWeight: 200 }}
                onChange={handleFileChange}
                disabled={processingSubmission}
                ref={fileInputRef}
            />
            <Select
                label="Region"
                value={selectedRegion}
                isRequired
                onChange={(e) => handleRegionChange(e as React.ChangeEvent<HTMLSelectElement>)}
                disabled={processingSubmission}
                defaultSelectedKeys={["IN"]}
            >
                <SelectSection title="Regions">
                    <SelectItem key="IN" value="IN">India</SelectItem>
                    <SelectItem key="US" value="US">United States</SelectItem>
                </SelectSection>
            </Select>
            <div className='mt-8'>
                <Input
                    type={showSecretKey ? 'text' : 'password'}
                    label="Enter Secret Key"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                    isRequired
                    disabled={processingSubmission}
                    value={secretKey}
                    onChange={handleSecretKeyChange}
                    endContent={
                        <button
                            onClick={() => setShowSecretKey(!showSecretKey)}
                            style={{
                                padding: '0.5rem',
                            }}
                        >
                            {showSecretKey ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    }
                />
            </div>

            <Button
                style={{
                    padding: '0.75rem 1.5rem',
                    fontWeight: 600,
                    backgroundColor: selectedFile && secretKey ? '#cccccc' : 'default',
                    color: selectedFile && secretKey ? '#000000' : '#666666',
                    cursor: selectedFile && secretKey ? 'pointer' : 'not-allowed',
                }}
                type='submit'
                disabled={!selectedFile || !secretKey || !selectedRegion || processingSubmission}
                onClick={handleSubmit}
            >
                {processingSubmission ? 'Processing...' : 'Submit'}
            </Button>
        </div>
    );
}