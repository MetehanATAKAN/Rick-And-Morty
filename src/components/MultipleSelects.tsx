import React, { useEffect, useRef, useState } from 'react'

type Rick = {
    id: string,
    name: string,
    image: string,
    episode: number,
    select: boolean
}

type ErrorInfo = {
    isError: boolean,
    message: string
}

const MultipleSelects = () => {

    const [options, setOptions] = useState<Rick[]>([]);

    const [selectOptions, setSelectOptions] = useState<Rick[]>([]);

    const [name, setName] = useState<string>('');

    const [showDropdown, setShowDropdown] = useState<boolean>(false);
   
    
    const [loading, setLoading] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState<ErrorInfo>({
        isError: false,
        message: ''
    });

    const [hiddenItemCount, setHiddenItemCount] = useState<number>(0);

    const searchOnChange = (e: string) => {
        setShowDropdown(true);
        setName(e);
    }

    const checkOnChange = (e: string) => {
        const newOptions = options.map(data => {
            if (data.id === e) {
                data.select = !data.select;
            }
            return data
        })

        const newSelectOptions = options.filter(data => data.select === true);
        const filteredNewSelectOptions = newSelectOptions.filter(newOption => {
            return !selectOptions.some(existingOption => existingOption.id === newOption.id);
        });

        setSelectOptions([...selectOptions, ...filteredNewSelectOptions]);
        setOptions(newOptions);
    }

    /**itemleri silmek */
    const deleteItem = (id: string) => {
        const newOptions = options.map(data => {
            if (data.id === id) {
                data.select = !data.select
            }
            return data
        })
        setOptions(newOptions);
        setSelectOptions(selectOptions.filter(data => data.id !== id));
    }

    /**inputa focuslanmak */
    const handleClick = (): void => {
        
        if (inputRef.current) {
            inputRef.current.focus();
            setShowDropdown(!showDropdown);
        }
    };

    /** önceden seçilmiş mi kontrolü yapıyorum */
    const isIncludesSelectOptions = (id: string) => {
        for (var i = 0; i < selectOptions.length; i++) {
            if (selectOptions[i].id === id) {
                return true;
            }
        }
        return false;
    }

    /**aranan kelimeyi strong yapan fonksiyon */
    const boldSubstring = (str: string, sub: string) => {
        const index = str.toLowerCase().indexOf(sub.toLowerCase());
        if (index === -1) return str;
        return (
            <span>
                {str.substring(0, index)}
                <strong>{str.substring(index, index + sub.length)}</strong>
                {str.substring(index + sub.length)}
            </span>
        );
    };

    const rickAndMortyRequest = async () => {
        setLoading(true)
        try {
            const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${name}`);
            const result = await response.json();
            if (response.status === 200) {

                setOptions(result.results?.map((item: any) => (
                    {
                        id: String(item.id),
                        name: item.name,
                        image: item.image,
                        episode: item.episode.length,
                        select: isIncludesSelectOptions(String(item.id))
                    }
                )));
                setError({ ...error, isError: false, message: '' });
                setTimeout(() => { // bu kısımda 1 saniye gecikme ile verileri gösteriyorum
                    setLoading(false);
                }, 1000);
            }
            else {
                setError({ ...error, isError: true, message: result.error });
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        rickAndMortyRequest();
    }, [name])

    /**seçilen itemler 2 den fazla ise hiddenItemCountu değiştiriyorum */
    useEffect(() => {
        const selectOptionsCount: number = selectOptions.filter(data => data.select).length;
        setHiddenItemCount(selectOptionsCount - 2);
    }, [selectOptions])

    useEffect(() => {
        /**Sayfa üzerinde herhangi bir yere tıklandığında çalışacak event listener */
        const handleClickOutside = (event: any): void => {
            /**Eğer tıklanan element, içinde bulunduğumuz bileşenin bir parçası değilse, showDropdown'u false yap */
            if (!(event.target as HTMLElement).closest('.multiple-select-auto-complete')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        /**Component unmount olduğunda event listener'ı temizle */
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className='multiple-select-auto-complete'>
            <div className='multiple-select' onClick={handleClick}>

                <div className='select-options'>
                    {
                        selectOptions?.filter(data => data.select).slice(0, 2).map(opt => (
                            opt.select && (
                                <div className='item'>
                                    <span className='character-name'> {opt.name}</span>
                                    <button
                                        className='delete-icon'
                                        onClick={() => deleteItem(opt.id)}
                                    >
                                        x
                                    </button>
                                </div>
                            )
                        ))
                    }
                    {
                        hiddenItemCount > 0 && (
                            <div className="item my-hidden">{`+${hiddenItemCount} more`}</div>
                        )
                    }
                </div>

                <input
                    onChange={(e) => searchOnChange(e.target.value)}
                    ref={inputRef}
                />
                <div onClick={() => setShowDropdown(!showDropdown)} className={`dropdown-icon dropdown-icon-${showDropdown}`}></div>
            </div>
            {
                showDropdown && (
                    <div className='rick-and-morty-charecters-info'>
                        {
                            loading
                                ? <div className='loading'> Loading ... </div>
                                : error.isError
                                    ? <div className='error-message'> {error.message} </div>
                                    : options?.map(data => (
                                        <div className='rick-and-morty-charecters-all-info'>
                                            <input
                                                type='checkbox'
                                                value={data.name}
                                                checked={data.select}
                                                id={data.id}
                                                onChange={(e) => checkOnChange(e.target.id)}
                                            />
                                            <div className='image-info'>
                                                <span>
                                                    <img
                                                        className='rick-and-morty-charecters-image'
                                                        src={data.image}
                                                        alt={data.name}
                                                        width={50}
                                                        height={50}
                                                    />
                                                </span>
                                                <div className='info'>
                                                    <span> {boldSubstring(data.name, name)} </span>
                                                    <span> {`${data.episode} Episodes`} </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default MultipleSelects