import { motion } from 'framer-motion'
import { Switch } from '@renderer/components/ui/switch'
import { ReactNode, useState } from 'react'
import { Home, Paintbrush } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Separator } from '@renderer/components/ui/separator'

enum OptionType {
    Switch
}

interface Option {
    id: string
    title: string
    description: string
    type: OptionType
    onChange: (value: any) => void
}

interface Category {
    id: string
    icon: ReactNode
    title: string
    options: Option[]
}

export default function SettingsPage() {
    const categories: Category[] = [
        {
            id: 'general',
            icon: <Home />,
            title: 'General',
            options: [
                {
                    id: 'exit_on_close',
                    title: 'Exit on Close',
                    description: 'Exit the application when closing the window.',
                    type: OptionType.Switch,
                    onChange: () => {}
                }
            ]
        },
        {
            id: 'appearance',
            icon: <Paintbrush />,
            title: 'Appearance',
            options: []
        }
    ]
    const [category, setCategory] = useState<Category>(categories[0])

    return (
        <motion.main className="w-full p-4 flex flex-col gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-8">
                {categories.map((cat) => (
                    <div
                        className={twMerge(
                            'cursor-pointer flex flex-col items-center text-primary-300 border-b-2 border-transparent transition-colors duration-100 hover:text-text-200',
                            cat.id === category.id && 'text-text-100 border-primary-300 hover:text-text-100'
                        )}
                        onClick={() => setCategory(cat)}
                    >
                        {cat.icon}
                        {cat.title}
                    </div>
                ))}
            </div>
            <Separator />
            <motion.div
                className="flex flex-col gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={category.id}
            >
                <h2 className="font-semibold text-2xl">{category.title}</h2>
                <div className="flex flex-col gap-8">
                    {category.options.map((option) => (
                        <div className="flex gap-4 justify-between" key={option.id}>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-lg">{option.title}</h3>
                                <p className="text-base text-background-300/70">{option.description}</p>
                            </div>
                            {option.type == OptionType.Switch && <Switch size="lg" onChange={option.onChange} />}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.main>
    )
}
