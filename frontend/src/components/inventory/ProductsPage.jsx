import { useEffect, useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, EllipsisVertical, Plus } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    // AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
    const api = useApi()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', imageURL: null, price: '', stock: '', minStock: '10' })

    const load = async () => {
        try {
        const data = await api.get('/products')
        setProducts(data)
        } finally {
        setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    useEffect(() => { console.log(form?.imageURL) }, [form?.imageURL])

    const handleCreate = async () => {
        await api.post('/products', {
            name: form.name,
            imageURL: form.imageURL,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            minStock: parseInt(form.minStock),
        })
        setForm({ name: '', imageURL: null, price: '', stock: '', minStock: '10' })
        load()
    }

    const handleDelete = async (id) => {
        await api.delete(`/products/${id}`)
        load()
    }

    if (loading) return <div className="p-4">Cargando productos...</div>

    return (
        <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Productos</h2>
            <AlertDialog>
                <AlertDialogTrigger render={<Button className='rounded-sm' />}>
                    <Plus className='w-4 h-4'/>
                    Nuevo producto
                </AlertDialogTrigger>
                <AlertDialogContent size='w-[70vw]'>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Register new product</AlertDialogTitle>
                        <div className='grid grid-flow-col grid-cols-2 w-full gap-4'>
                            <div className='flex flex-col w-full gap-3'>
                                <Input placeholder="URL Imagen" value={form?.imageURL} onChange={e => setForm({...form, imageURL: e.target.value})} />
                                <Input placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                <Input placeholder="Precio" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                                <Input placeholder="Stock inicial" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
                                <Input placeholder="Stock mínimo" type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} />
                            </div>                     
                            {
                                form?.imageURL !== null || form?.imageURL !== '' ? (
                                    <img
                                        src={form.imageURL}
                                        alt="Producto"
                                        className="w-full h-82 object-contain rounded-md"
                                    />
                                ) : (
                                    <Card className="w-full h-82 object-cover rounded-md">
                                        <CardContent className='my-auto'>No Image</CardContent>
                                    </Card>
                                )
                            }
                        </div>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCreate}>
                            Guardar
                        </AlertDialogAction>
                        </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => {
                const lowStock = p.stock <= p.minStock

                function formatNumber(num) {
                    if (num >= 1000) {
                        // Divide, fix to 1 decimal, replace ".0" with empty string
                        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
                    }
                    return num;
                }

                return (
                    <Card 
                        key={p.id} 
                        className={`max-w-md ${p.stock <= p.minStock ? 'border-red-500' : ''}`}
                        onClick={() => console.log('Clicked product', p)}
                    >
                        <CardHeader className='relative flex flex-col gap-4'>
                            <div className='absolute right-1.5 -top-2 z-40'>
                                <Popover>
                                    <PopoverTrigger render={
                                        <Button className='  rounded-md p-1' variant="ghost" size="icon">
                                            <EllipsisVertical className='w-4 h-4' />
                                        </Button>
                                        } />
                                    <PopoverContent align="start">
                                        <PopoverHeader>
                                            <PopoverTitle>Dimensions</PopoverTitle>
                                        </PopoverHeader>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {
                                p?.imageURL ? 
                                <img
                                    src={p.imageURL}
                                    alt="Producto"
                                    className="w-36 h-36 object-contain rounded-md mx-auto"
                                />
                                : 
                                <Package className='w-36 h-36 shadow-md mx-auto' />
                            }
                            <CardTitle className='flex flex-col'>
                                <span className='text-xs'>{p?.supplier?.name || 'Proveedor no especificado'}</span>
                                <span className='text-lg'>{p?.name}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='flex flex-row justify-between gap-3'>
                            <p className="text-lg font-bold">${ Number(p?.price || 0).toFixed(2) }</p>
                            <Badge variant={p.stock <= p.minStock ? "destructive" : "default"}>
                                Stock: {formatNumber(p?.stock || 0)}
                            </Badge>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
    )
}