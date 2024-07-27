'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';

export default function TagsComponent({ form }) {
    const [tagArray, setTagArray] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isFocus, setIsFocus] = useState(false);

    useEffect(() => {
        if (tagArray.length > 0) {
            form.setValue('tags', tagArray);
        }
    }, [tagArray, form]);

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setTagInput('');
                setTagArray([]);
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    function handelInputChange(event) {
        form.clearErrors('tags');
        const inputValue = event.target.value;
        setTagInput(inputValue);

        if (inputValue.includes(';')) {
            const newTag = inputValue.replace(';', '').trim();
            if (!tagArray.includes(newTag)) {
                setTagArray((prev) => [...prev, newTag]);
                setTagInput('');
            } else {
                setTagInput(newTag);
                form.setError('tags', {
                    type: 'manual',
                    message: 'Tag muse be unique',
                });
            }
        } else {
            setTagInput(inputValue);
        }
    }

    return (
        <>
            <FormField
                control={form.control}
                name="tags"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Tags</FormLabel>
                        <FormControl>
                            <div
                                className={`${
                                    isFocus
                                        ? 'shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]'
                                        : ''
                                } w-full bg-transparent border border-neutral-500/20
                                p-2 rounded flex items-center gap-x-1 flex-wrap duration-150`}>
                                {tagArray.length > 0 &&
                                    tagArray.map((tag) => (
                                        <TagElement
                                            key={tag}
                                            tag={tag}
                                            onDelete={setTagArray}
                                        />
                                    ))}
                                <Input
                                    value={tagInput}
                                    onChange={handelInputChange}
                                    onFocus={() => setIsFocus(true)}
                                    onBlur={() => setIsFocus(false)}
                                    className={`${
                                        tagArray.length > 0 ? 'w-fit' : ''
                                    } bg-transparent border-none`}
                                    placeholder="example; tag;"
                                />
                            </div>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}

function TagElement({ tag, onDelete }) {
    function handelDelete(deleteTag) {
        onDelete((prev) => prev.filter((item) => item !== deleteTag));
    }

    return (
        <p className="flex items-center gap-1 bg-slate-400/35 rounded py-1 px-2">
            {tag}{' '}
            <span className="cursor-pointer" onClick={() => handelDelete(tag)}>
                <IoMdCloseCircle className="hover:scale-110 duration-150" />
            </span>
        </p>
    );
}
