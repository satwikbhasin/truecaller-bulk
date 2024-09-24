"use client";

import { useState, useRef } from 'react';
import { Input } from '@nextui-org/input';
import { Button } from '@nextui-org/button';
import { Select, SelectSection, SelectItem } from '@nextui-org/select';
import { Tooltip } from '@nextui-org/tooltip';
import { Eye, EyeOff, CircleAlert, ClipboardCopy, Info } from 'lucide-react';
import { processSubmission } from '@/services/processSubmission';

export default function Main() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [secretKey, setSecretKey] = useState<string>('');
    const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
    const [processingSubmission, setProcessingSubmission] = useState<boolean>(false);
    const [selectedRegion, setSelectedRegion] = useState<string>('IN');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_RATE_LIMIT = parseInt(process.env.NEXT_PUBLIC_API_RATE_LIMIT || "20", 10);
    const [limitExceeded, setLimitExceeded] = useState<boolean>(false);

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
        setErrorMessage(null);
        try {
            const limitExceeded = await processSubmission(selectedFile, secretKey, selectedRegion);
            if (limitExceeded) {
                setLimitExceeded(true);
                setErrorMessage(`Only first ${API_RATE_LIMIT} Phone numbers processed`);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setProcessingSubmission(false);
            setSecretKey('');
            setSelectedFile(null);
            setSelectedRegion('IN');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setSecretKey(text);
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
        }
    };

    return (
        <div className="mt-8 flex flex-col gap-4 w-full sm:w-4/5 md:w-3/5 lg:w-1/2">
            <Input
                type="file"
                label="Upload Phone numbers in CSV"
                accept='.csv'
                isRequired
                style={{ fontWeight: 200 }}
                onChange={handleFileChange}
                disabled={processingSubmission}
                ref={fileInputRef}
                endContent={
                    <Tooltip delay={0} closeDelay={0} content={
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            padding: '1rem',
                        }}>
                            <h4 style={{
                                fontWeight: 600,
                            }}>Expected CSV Format</h4>
                            <img height={300}
                                width={300}
                                src="/assets/csv_example_1.png" alt="Info" />
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <h5 style={{
                                    fontWeight: 500,
                                }}>or</h5>
                            </div>
                            <img height={300}
                                width={300}
                                src="/assets/csv_example_2.png" alt="Info" />
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <h5 style={{
                                    fontWeight: 400,
                                    color: '#F31260',
                                }}>Make sure to write <span style={{
                                    fontWeight: 600,
                                }}>phone
                                    </span> at the top as shown</h5>
                            </div>
                        </div>
                    } placement="bottom">
                        <button
                            style={{
                                padding: '0.5rem',
                                marginLeft: '0.5rem',
                            }}
                        >
                            <Info size={20} />
                        </button>
                    </Tooltip>
                }
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
            <div>
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
                        <>
                            <button
                                onClick={handlePasteFromClipboard}
                                style={{
                                    padding: '0.5rem',
                                    marginLeft: '0.5rem',
                                }}
                            >
                                <ClipboardCopy size={20} />
                            </button>
                            <button
                                onClick={() => setShowSecretKey(!showSecretKey)}
                                style={{
                                    padding: '0.5rem',
                                }}
                            >
                                {showSecretKey ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </>
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

            <div style={{ height: '5vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%" }}>
                {errorMessage && (
                    <div style={{ color: limitExceeded ? '#F36136' : '#F31260', display: 'flex', alignItems: 'center' }}>
                        <CircleAlert size={20} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{errorMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
}